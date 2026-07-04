/**
 * Real-time architecture stub — designed for horizontal scaling via Redis Pub/Sub adapter.
 * Wire to Socket.io or ws server when deploying real-time features.
 */

export type RealtimeEventType =
  | 'feed:update'
  | 'notification:new'
  | 'message:typing'
  | 'user:online'
  | 'user:offline';

export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType;
  payload: T;
  userId?: string;
  roomId?: string;
  timestamp: string;
}

export interface RealtimeAdapter {
  publish(channel: string, event: RealtimeEvent): Promise<void>;
  subscribe(channel: string, handler: (event: RealtimeEvent) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
}

class InMemoryRealtimeAdapter implements RealtimeAdapter {
  private handlers = new Map<string, Set<(event: RealtimeEvent) => void>>();

  async publish(channel: string, event: RealtimeEvent) {
    this.handlers.get(channel)?.forEach((handler) => handler(event));
  }

  async subscribe(channel: string, handler: (event: RealtimeEvent) => void) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);
  }

  async unsubscribe(channel: string) {
    this.handlers.delete(channel);
  }
}

let adapter: RealtimeAdapter = new InMemoryRealtimeAdapter();

export function setRealtimeAdapter(newAdapter: RealtimeAdapter) {
  adapter = newAdapter;
}

export const realtime = {
  publishFeedUpdate(userId: string, postId: string) {
    return adapter.publish(`feed:${userId}`, {
      type: 'feed:update',
      payload: { postId },
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  publishNotification(userId: string, notification: unknown) {
    return adapter.publish(`notifications:${userId}`, {
      type: 'notification:new',
      payload: notification,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  subscribeToFeed(userId: string, handler: (event: RealtimeEvent) => void) {
    return adapter.subscribe(`feed:${userId}`, handler);
  },

  subscribeToNotifications(userId: string, handler: (event: RealtimeEvent) => void) {
    return adapter.subscribe(`notifications:${userId}`, handler);
  },
};
