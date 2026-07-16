'use client';

import { io, type Socket } from 'socket.io-client';

export type SafeReachRealtimeEvent<TPayload = unknown> = {
  type: string;
  payload: TPayload;
  sentAt: string;
};

type Handler = (event: SafeReachRealtimeEvent) => void;

const DEFAULT_SOCKET_URL = 'http://localhost:5000';

class SafeReachRealtimeClient {
  private socket: Socket | null = null;
  private handlers = new Set<Handler>();
  private offlineEvents: SafeReachRealtimeEvent[] = [];

  connect(url = import.meta.env.VITE_SAFEREACH_WS_URL ?? DEFAULT_SOCKET_URL) {
    if (typeof window === 'undefined' || this.socket?.connected) return;
    try {
      this.socket = io(url, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });
      this.socket.on('connect', () => {
        const queued = [...this.offlineEvents];
        this.offlineEvents = [];
        queued.forEach(event => this.send(event.type, event.payload));
      });
      this.socket.on('safe.connected', payload => this.emit({ type: 'safe.connected', payload, sentAt: new Date().toISOString() }));
      [
        'auth.login.success',
        'auth.login.error',
        'data.bootstrap.success',
        'data.bootstrap.error',
        'student.status.changed',
        'attendance.marked',
        'timetable.updated',
        'timetable.error',
        'industry.menu.updated',
        'industry.menu.error',
        'safe.error',
      ].forEach(eventName => {
        this.socket?.on(eventName, payload => this.emit({ type: eventName, payload, sentAt: new Date().toISOString() }));
      });
      this.socket.on('disconnect', () => {
        this.emit({ type: 'safe.disconnected', payload: {}, sentAt: new Date().toISOString() });
      });
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
    if (this.socket?.connected) {
      this.socket.emit(type, payload);
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
