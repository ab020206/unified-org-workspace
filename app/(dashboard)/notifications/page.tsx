'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '@/lib/notificationApi';
import { NotificationDto, NotificationType } from '@workspace/shared-types';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { CommandBar } from '@/components/ui/CommandBar';
import { Bell, Settings, Mail, Smartphone, Check } from 'lucide-react';

export default function NotificationsPage() {
  const { activeOrganization } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference State
  const [emailDigestFrequency, setEmailDigestFrequency] = useState('DAILY');
  const [emailInstantEvents, setEmailInstantEvents] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isSavingPref, setIsSavingPref] = useState(false);

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

  const loadPreferences = useCallback(async () => {
    if (!activeOrganization?.id) return;
    try {
      const res = await fetch('/api/v1/notifications/preferences', {
        headers: { 'x-organization-id': activeOrganization.id },
      }).then((r) => r.json());

      if (res.success && res.data) {
        setEmailDigestFrequency(res.data.emailDigestFrequency || 'DAILY');
        setEmailInstantEvents(res.data.emailInstantEvents ?? true);
        setPushEnabled(res.data.pushEnabled ?? false);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  const handleSavePreferences = async () => {
    if (!activeOrganization?.id) return;
    setIsSavingPref(true);
    try {
      await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'x-organization-id': activeOrganization.id,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailDigestFrequency,
          emailInstantEvents,
          pushEnabled,
        }),
      });

      // Browser Push Registration attempt
      if (pushEnabled && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-Skv69yViEuiBIa',
          });

          await fetch('/api/v1/notifications/push/subscribe', {
            method: 'POST',
            headers: {
              'x-organization-id': activeOrganization.id,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              keys: {
                p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh') || []))),
                auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth') || []))),
              },
            }),
          });
        } catch (e) {
          console.warn('Browser Web Push subscription fallback:', e);
        }
      }

      alert('Notification delivery preferences updated successfully!');
      setShowPreferences(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save preferences');
    } finally {
      setIsSavingPref(false);
    }
  };

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
      <CommandBar
        moduleName="Multi-Channel Notification Center"
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

      {/* Preferences Toggle Header */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">Multi-Channel Delivery Settings</h4>
            <p className="text-[11px] text-text-secondary">
              Configure Email AI Digest schedules, Instant alerts, and Browser Push
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="px-3 py-1.5 bg-surface-secondary hover:bg-surface-secondary/80 text-text-primary text-xs font-semibold rounded border border-border transition-colors cursor-pointer"
        >
          {showPreferences ? 'Close Preferences' : 'Configure Preferences'}
        </button>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <div className="forge-panel forge-accent-notifications p-6 space-y-6 bg-surface border border-border">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Delivery Channel Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Digest Frequency */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-secondary uppercase">
                Email AI Digest Frequency
              </label>
              <select
                value={emailDigestFrequency}
                onChange={(e) => setEmailDigestFrequency(e.target.value)}
                className="w-full bg-surface-secondary border border-border rounded p-2 text-xs text-text-primary"
              >
                <option value="DAILY">Daily Executive Digest</option>
                <option value="WEEKLY">Weekly Summary Briefing</option>
                <option value="NEVER">Never (In-App Only)</option>
              </select>
            </div>

            {/* Instant Event Email Alerts */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-secondary uppercase">
                Instant Email Alerts
              </label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="instantEmail"
                  checked={emailInstantEvents}
                  onChange={(e) => setEmailInstantEvents(e.target.checked)}
                  className="rounded border-border bg-surface-secondary text-primary"
                />
                <label htmlFor="instantEmail" className="text-xs text-text-primary">
                  Email me instantly on approvals, ticket assignments & security events
                </label>
              </div>
            </div>

            {/* Browser Push Notifications */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-text-secondary uppercase">
                Browser Web Push
              </label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pushNotifs"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="rounded border-border bg-surface-secondary text-primary"
                />
                <label
                  htmlFor="pushNotifs"
                  className="text-xs text-text-primary flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5 text-primary" /> Enable browser push
                  notifications
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSavePreferences}
              disabled={isSavingPref}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {isSavingPref ? 'Saving Settings...' : 'Save Delivery Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="forge-panel forge-accent-notifications p-8 text-center animate-pulse text-xs text-text-secondary font-mono">
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
          <h3 className="text-sm font-bold text-text-primary">No notifications</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You&apos;re all caught up! Zero unread activity alerts in your multi-channel queue.
          </p>
        </div>
      )}
    </div>
  );
}
