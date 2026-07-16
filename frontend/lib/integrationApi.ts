'use client';

const API_BASE = import.meta.env.VITE_SAFEREACH_API_URL ?? 'http://localhost:5000/api/v1';

export type IntegrationStatus = {
  key: string;
  name: string;
  configured: boolean;
  required: boolean;
  usedFor: string;
};

export type IntegrationStatusResponse = {
  ok: boolean;
  missingRequired: string[];
  integrations: IntegrationStatus[];
};

export async function fetchIntegrationStatus(): Promise<IntegrationStatusResponse> {
  const response = await fetch(`${API_BASE}/integrations/status`, { cache: 'no-store' });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload.message === 'string'
      ? payload.message
      : `Backend returned ${response.status}`;
    throw new Error(message);
  }
  return payload as IntegrationStatusResponse;
}
