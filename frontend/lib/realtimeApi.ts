'use client';

export type SafeReachRealtimeEvent<TPayload = unknown> = {
  type: string;
  payload: TPayload;
  sentAt: string;
};

type Handler = (event: SafeReachRealtimeEvent) => void;

const DEFAULT_SOCKET_URL = 'ws://localhost:5000/ws/safereach';

class SafeReachRealtimeClient {
  private socket: WebSocket | null = null;
  private handlers = new Set<Handler>();
  private offlineEvents: SafeReachRealtimeEvent[] = [];

  connect(url = process.env.NEXT_PUBLIC_SAFEREACH_WS_URL ?? DEFAULT_SOCKET_URL) {
    if (typeof window === 'undefined' || this.socket?.readyState === WebSocket.OPEN) return;
    try {
      this.socket = new WebSocket(url);
      this.socket.onmessage = message => {
        try {
          this.emit(JSON.parse(message.data) as SafeReachRealtimeEvent);
        } catch {
          this.emit({ type: 'system.websocket.invalid_message', payload: message.data, sentAt: new Date().toISOString() });
        }
      };
      this.socket.onopen = () => {
        const queued = [...this.offlineEvents];
        this.offlineEvents = [];
        queued.forEach(event => this.send(event.type, event.payload));
      };
      this.socket.onclose = () => {
        this.socket = null;
      };
    } catch {
      this.socket = null;
    }
  }

  subscribe(handler: Handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(type: string, payload: unknown = {}) {
    const event: SafeReachRealtimeEvent = { type, payload, sentAt: new Date().toISOString() };
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
      return;
    }
    this.offlineEvents.push(event);
    this.emit({ ...event, type: `${type}.offline_preview` });
  }

  private emit(event: SafeReachRealtimeEvent) {
    this.handlers.forEach(handler => handler(event));
  }
}

export const safereachRealtime = new SafeReachRealtimeClient();

export const realtimeEvents = {
  studentStatusChanged: 'student.status.changed',
  parentSmsQueued: 'notification.sms.queued',
  attendanceMarked: 'attendance.marked',
  incidentUpdated: 'incident.updated',
  profileImageUpdated: 'profile.image.updated',
};
