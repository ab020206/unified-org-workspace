'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '@/lib/notificationApi';
import { NotificationDto, NotificationType } from '@workspace/shared-types';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { CommandBar } from '@/components/ui/CommandBar';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { activeOrganization } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!activeOrganization?.id) return;
    setIsLoading(true);
    try {
      const data = await notificationApi.getNotifications(
        {
          type: filterType !== 'ALL' ? (filterType as NotificationType) : undefined,
        },
        activeOrganization.id
      );
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, filterType]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id, activeOrganization?.id);
      await loadNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead(activeOrganization?.id);
      await loadNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to mark all read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id, activeOrganization?.id);
      await loadNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6">
      {/* FORGE UI Command Bar */}
      <CommandBar
        moduleName="Notification Center"
        moduleAccent="notifications"
        breadcrumbs={['Workspace', 'Notification Center', 'Alerts']}
        searchPlaceholder="Search system notifications..."
        filterOptions={[
          { label: 'All Alerts', value: 'ALL' },
          { label: 'System', value: 'SYSTEM' },
          { label: 'Tickets', value: 'TICKET_ASSIGNED' },
          { label: 'Reviews', value: 'PR_REVIEW_REQUESTED' },
        ]}
        activeFilter={filterType}
        onFilterChange={setFilterType}
        primaryActionLabel={unreadCount > 0 ? `Mark All Read (${unreadCount})` : undefined}
        onPrimaryAction={handleMarkAllRead}
      />

      {/* Notifications List */}
      {isLoading ? (
        <div className="forge-panel forge-accent-notifications p-8 text-center animate-pulse text-xs text-muted-foreground font-mono">
          Loading notifications...
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="forge-panel forge-accent-notifications p-12 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No notifications</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You're all caught up! Zero unread activity alerts in your queue.
          </p>
        </div>
      )}
    </div>
  );
}
