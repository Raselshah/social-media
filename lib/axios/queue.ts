type QueuedRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: () => Promise<unknown>;
};

let isRefreshing = false;
let refreshQueue: QueuedRequest[] = [];

export function getIsRefreshing(): boolean {
  return isRefreshing;
}

export function setIsRefreshing(value: boolean): void {
  isRefreshing = value;
}

export function enqueueRequest(request: QueuedRequest): void {
  refreshQueue.push(request);
}

export function flushQueue(error: unknown | null): void {
  const queue = [...refreshQueue];
  refreshQueue = [];

  queue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      config().then(resolve).catch(reject);
    }
  });
}

export function clearQueue(): void {
  refreshQueue = [];
}
