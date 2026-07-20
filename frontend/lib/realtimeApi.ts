'use client';

import { io, type Socket } from 'socket.io-client';
import { socketBaseUrl } from './runtimeConfig';

export type SafeReachRealtimeEvent<TPayload = unknown> = {
  type: string;
  payload: TPayload;
  sentAt: string;
};

type Handler = (event: SafeReachRealtimeEvent) => void;

const DEFAULT_SOCKET_URL = socketBaseUrl;

class SafeReachRealtimeClient {
  private socket: Socket | null = null;
  private handlers = new Set<Handler>();
  private offlineEvents: SafeReachRealtimeEvent[] = [];

  connect(url = DEFAULT_SOCKET_URL) {
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
        'message.created',
        'absence.reason.submitted',
        'attendance.absence.notified',
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

  request<TPayload = unknown, TResult = unknown>(type: string, payload: TPayload, timeoutMs = 10000): Promise<TResult> {
    this.connect();
    return new Promise((resolve, reject) => {
      const socket = this.socket;
      if (!socket) {
        reject(new Error('Realtime socket is not available'));
        return;
      }
      const finish = (result: { ok?: boolean; data?: TResult; message?: string } | TResult) => {
        if (result && typeof result === 'object' && 'ok' in result) {
          if ((result as { ok?: boolean }).ok) {
            resolve((result as { data?: TResult }).data as TResult);
          } else {
            reject(new Error((result as { message?: string }).message || 'Realtime request failed'));
          }
          return;
        }
        resolve(result as TResult);
      };
      const emitRequest = () => {
        const timeout = window.setTimeout(() => reject(new Error('Realtime request timed out')), timeoutMs);
        socket.emit(type, payload, (result: { ok?: boolean; data?: TResult; message?: string } | TResult) => {
          window.clearTimeout(timeout);
          finish(result);
        });
      };
      if (socket.connected) {
        emitRequest();
        return;
      }
      const connectTimeout = window.setTimeout(() => {
        socket.off('connect', onConnect);
        reject(new Error('Realtime socket is not connected'));
      }, 2500);
      const onConnect = () => {
        window.clearTimeout(connectTimeout);
        emitRequest();
      };
      socket.once('connect', onConnect);
    });
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
  messageCreated: 'message.created',
  absenceReasonSubmitted: 'absence.reason.submitted',
  absenceNotificationSent: 'attendance.absence.notified',
  incidentUpdated: 'incident.updated',
  profileImageUpdated: 'profile.image.updated',
};
