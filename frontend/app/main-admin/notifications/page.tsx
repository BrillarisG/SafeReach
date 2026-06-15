'use client';

import MainAdminShell from '@/components/MainAdminShell';
import NotificationCenter from '@/components/NotificationCenter';

export default function MainAdminNotificationsPage() {
  return (
    <MainAdminShell active="notifications" title="Platform Notifications" subtitle="DB3 realtime event stream for all schools and roles">
      <NotificationCenter audience="main-admin" />
    </MainAdminShell>
  );
}
