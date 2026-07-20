'use client';

import LoadingRing from '@/components/LoadingRing';
import { useBackendBootstrap } from '@/lib/backendData';

/** Shows the shared full-screen ring only while a role route loads stored data. */
export default function RoleBootstrapLoader() {
  const { loading } = useBackendBootstrap();
  return loading ? <LoadingRing size="lg" /> : null;
}
