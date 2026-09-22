import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { obraStore } from '../services/store';
import { NotificationItem, User } from '../types';

interface NotificationBellProps {
  currentUser: User;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNotifications = () => {
      const state = obraStore.getState();
      const list = (state.notifications || []).filter(n => n.userId === currentUser.id);
      setNotifications(list);
    };

    updateNotifications();
    const unsubscribe = obraStore.subscribe(updateNotifications);
    return () => unsubscribe();
  }, [currentUser.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    obraStore.markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    obraStore.markAllNotificationsAsRead(currentUser.id);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'ACTION_REQUIRED':
        return <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef} id="notification-bell-container">
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 rounded-lg border border-slate-800 cursor-pointer flex items-center justify-center focus:outline-none"
        title="Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div id="notification-dropdown" className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-slate-800 bg-[#0F172A] shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-brand-accent" />
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-brand-accent hover:text-brand-accent/80 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No tienes notificaciones aún.</p>
                <p className="text-[10px] text-slate-500">Te avisaremos sobre partes enviados, disputas y compliance.</p>
              </div>
            ) : (
              notifications.map((not) => (
                <div
                  key={not.id}
                  id={`not-item-${not.id}`}
                  onClick={() => obraStore.markNotificationAsRead(not.id)}
                  className={`flex gap-3 p-3.5 transition-colors cursor-pointer select-none ${
                    not.read ? 'bg-transparent hover:bg-slate-900/40' : 'bg-slate-900/70 hover:bg-slate-900/90 border-l-2 border-brand-accent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(not.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-bold text-slate-200 truncate ${!not.read && 'font-black text-white'}`}>
                        {not.title}
                      </p>
                      {!not.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(not.id, e)}
                          className="text-[10px] text-slate-500 hover:text-slate-300 p-0.5"
                          title="Marcar como leído"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed break-words">
                      {not.message}
                    </p>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1.5 uppercase tracking-wide">
                      {formatDate(not.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
