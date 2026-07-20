'use client';

import { useEffect, useState } from 'react';
import { apiBaseUrl } from './runtimeConfig';

type SafetyProtocolRole = 'parent' | 'teacher';

export type SafetyProtocol = {
  id: string;
  school_id: string;
  role_key: SafetyProtocolRole;
  label: string;
  checked: boolean;
  submitted: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || `Backend returned ${response.status}`);
  }
  return payload as T;
}

export function useSafetyProtocols(role: SafetyProtocolRole) {
  const [protocols, setProtocols] = useState<SafetyProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const rows = await apiRequest<SafetyProtocol[]>(`/safety-protocols?role=${role}`);
      setProtocols(rows);
      setError('');
    } catch (reason) {
      setProtocols([]);
      setError(reason instanceof Error ? reason.message : 'Safety protocols unavailable');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [role]);

  async function add(label: string) {
    const created = await apiRequest<SafetyProtocol>('/safety-protocols', {
      method: 'POST',
      body: JSON.stringify({ role, label }),
    });
    setProtocols(current => [...current, created]);
    return created;
  }

  async function update(id: string, patch: Partial<Pick<SafetyProtocol, 'label' | 'checked' | 'submitted'>>) {
    const updated = await apiRequest<SafetyProtocol>(`/safety-protocols/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setProtocols(current => current.map(item => item.id === id ? updated : item));
    return updated;
  }

  async function remove(id: string) {
    await apiRequest<SafetyProtocol>(`/safety-protocols/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    setProtocols(current => current.filter(item => item.id !== id));
  }

  async function submit(protocolIds: string[]) {
    const updated = await apiRequest<SafetyProtocol[]>('/safety-protocols/submit', {
      method: 'POST',
      body: JSON.stringify({ role, protocolIds }),
    });
    setProtocols(updated);
    return updated;
  }

  return { protocols, loading, error, refresh, add, update, remove, submit };
}
