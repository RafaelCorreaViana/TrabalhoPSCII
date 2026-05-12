import { useState } from 'react';
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = {
  REGISTRATION: '📝',
  EVENT_UPDATE: '📣',
  MATCH_UPDATE: '⚽',
  BOOKING: '🏟️',
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const markAll = useMarkAllAsRead();
  const markOne = useMarkAsRead();

  const notifications: any[] = data?.notifications || [];
  const unreadCount: number = data?.unreadCount || 0;

  const handleMarkOne = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try { await markOne.mutateAsync(id); } catch {}
  };

  return (
    <div className="notification-center">
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificações"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div className="notif-overlay" onClick={() => setOpen(false)} />
          <div className="notif-dropdown">
            <div className="notif-header">
              <h4>Notificações</h4>
              {unreadCount > 0 && (
                <button
                  className="btn-link text-sm"
                  onClick={() => markAll.mutate()}
                  disabled={markAll.isPending}
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">
                  <Bell size={32} />
                  <p>Nenhuma notificação ainda.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-item ${!notif.isRead ? 'notif-unread' : ''}`}
                    onClick={() => handleMarkOne(notif.id, notif.isRead)}
                  >
                    <span className="notif-icon">{TYPE_ICONS[notif.type] || '🔔'}</span>
                    <div className="notif-content">
                      <p className="notif-title">{notif.title}</p>
                      <p className="notif-message">{notif.message}</p>
                      <p className="notif-time">
                        {new Date(notif.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {!notif.isRead && <span className="notif-dot" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
