'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const ACTION_REFRESH_DELAY = 180;
const ROUTE_REFRESH_DELAY = 80;

export default function AppAutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (routeTimer.current) clearTimeout(routeTimer.current);
    routeTimer.current = setTimeout(() => {
      router.refresh();
      window.dispatchEvent(new Event('safereach-route-refreshed'));
    }, ROUTE_REFRESH_DELAY);

    return () => {
      if (routeTimer.current) clearTimeout(routeTimer.current);
    };
  }, [pathname, searchParams, router]);

  useEffect(() => {
    const scheduleRefresh = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-no-auto-refresh="true"]')) return;

      if (actionTimer.current) clearTimeout(actionTimer.current);
      actionTimer.current = setTimeout(() => {
        router.refresh();
        window.dispatchEvent(new Event('safereach-action-refreshed'));
      }, ACTION_REFRESH_DELAY);
    };

    window.addEventListener('click', scheduleRefresh, true);
    window.addEventListener('submit', scheduleRefresh, true);
    window.addEventListener('change', scheduleRefresh, true);
    window.addEventListener('safereach-refresh-requested', scheduleRefresh);

    return () => {
      if (actionTimer.current) clearTimeout(actionTimer.current);
      window.removeEventListener('click', scheduleRefresh, true);
      window.removeEventListener('submit', scheduleRefresh, true);
      window.removeEventListener('change', scheduleRefresh, true);
      window.removeEventListener('safereach-refresh-requested', scheduleRefresh);
    };
  }, [router]);

  return null;
}
