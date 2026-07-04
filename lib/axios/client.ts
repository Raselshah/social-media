'use client';

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_PATH, AUTH_CHANNEL_NAME, MAX_RETRIES, REQUEST_TIMEOUT_MS, RETRY_DELAY_MS } from '@/constants/api';
import { mapAxiosError } from '@/lib/axios/errors';
import {
  enqueueRequest,
  flushQueue,
  getIsRefreshing,
  setIsRefreshing,
} from '@/lib/axios/queue';

const isDev = process.env.NODE_ENV === 'development';

function logRequest(method: string | undefined, url: string | undefined) {
  if (isDev) {
    console.debug(`[API] ${method?.toUpperCase()} ${url}`);
  }
}

function getAuthChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
  return new BroadcastChannel(AUTH_CHANNEL_NAME);
}

export const apiClient = axios.create({
  baseURL: API_BASE_PATH,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers['X-Request-Id'] = crypto.randomUUID();
  config.headers['X-API-Version'] = 'v1';

  if (config.signal === undefined && config.method?.toLowerCase() === 'get') {
    const controller = new AbortController();
    config.signal = controller.signal;
  }

  logRequest(config.method, config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(mapAxiosError(error));
    }

    const status = error.response?.status;
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (getIsRefreshing()) {
        return new Promise((resolve, reject) => {
          enqueueRequest({
            resolve,
            reject,
            config: () => apiClient(originalRequest),
          });
        });
      }

      originalRequest._retry = true;
      setIsRefreshing(true);

      try {
        await axios.post(`${API_BASE_PATH}/auth/refresh`, {}, { withCredentials: true });

        const channel = getAuthChannel();
        channel?.postMessage({ type: 'TOKEN_REFRESHED' });
        channel?.close();

        flushQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);

        const channel = getAuthChannel();
        channel?.postMessage({ type: 'SESSION_EXPIRED' });
        channel?.close();

        return Promise.reject(mapAxiosError(refreshError));
      } finally {
        setIsRefreshing(false);
      }
    }

    const retryCount = originalRequest._retryCount ?? 0;
    const shouldRetry =
      retryCount < MAX_RETRIES &&
      (!status || status >= 500 || status === 429 || error.code === 'ECONNABORTED');

    if (shouldRetry) {
      originalRequest._retryCount = retryCount + 1;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retryCount + 1)));
      return apiClient(originalRequest);
    }

    return Promise.reject(mapAxiosError(error));
  },
);

export function createCancelToken() {
  return axios.CancelToken.source();
}

export function setupAuthSync(onSessionExpired: () => void, onTokenRefreshed: () => void) {
  const channel = getAuthChannel();
  if (!channel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'SESSION_EXPIRED') {
      onSessionExpired();
    } else if (event.data?.type === 'TOKEN_REFRESHED') {
      onTokenRefreshed();
    }
  };

  channel.addEventListener('message', handler);
  return () => {
    channel.removeEventListener('message', handler);
    channel.close();
  };
}
