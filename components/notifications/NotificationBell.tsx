'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '@/lib/notificationApi';
import { NotificationDto } from '@workspace/shared-types';
import { NotificationCard } from './NotificationCard';
import { Bell, ArrowRight } from 'lucide-react';

export function NotificationBell() {
  const { activeOrganization } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!activeOrganization?.id) return;
    try {
      const data = await notificationApi.getNotifications({ limit: 5 }, activeOrganization.id);
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id, activeOrganization?.id);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead(activeOrganization?.id);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-secondary border border-border transition-all cursor-pointer shadow-xs"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error text-white font-bold text-[9px] flex items-center justify-center border-2 border-surface animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-sm rounded-xl bg-surface border border-border shadow-md z-50 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Bell className="w-4 h-4 text-warning" />
              Notifications ({unreadCount} unread)
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-text">No notifications found</div>
            ) : (
              notifications.map((n) => (
                <NotificationCard key={n.id} notification={n} onMarkRead={handleMarkRead} />
              ))
            )}
          </div>

          <div className="pt-2 border-t border-border text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1"
            >
              <span>View Notification Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
