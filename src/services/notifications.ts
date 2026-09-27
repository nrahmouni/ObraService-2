/**
 * ObraService Pro - Push Notification Service
 * Manages Web Push / FCM permissions, service worker tokens,
 * and handles alerts for Daily Reports, Delivery Notes, and Compliance Expirations.
 */

import { obraStore } from './store';
import toast from 'react-hot-toast';

export type PushNotificationEventType = 
  | 'REPORT_SUBMITTED'
  | 'DELIVERY_NOTE_PENDING'
  | 'DELIVERY_NOTE_DISPUTED'
  | 'DOCUMENT_EXPIRING'
  | 'MEMBER_JOINED';

export interface PushNotificationPayload {
  title: string;
  body: string;
  eventType: PushNotificationEventType;
  targetId?: string;
  url?: string;
}

/**
 * Request user permission for Web Push notifications
 */
export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[PushNotifications] Push notifications are not supported in this browser environment.');
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Register service worker if supported
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('[PushNotifications] Push service worker registered successfully.');
          } catch (swErr) {
            console.warn('[PushNotifications] Service worker registration note:', swErr);
          }
        }
        toast.success('Notificaciones push activadas correctamente.');
        return true;
      }
    }
  } catch (err) {
    console.warn('[PushNotifications] Error requesting notification permission:', err);
  }
  return false;
}

/**
 * Trigger an operational alert (displays in-app toast, logs to store, and triggers OS-level notification if permitted)
 */
export async function dispatchOperationalNotification(payload: PushNotificationPayload) {
  const { title, body, eventType, targetId, url } = payload;
  const state = obraStore.getState();
  const currentUserId = state.currentUser?.id;

  // 1. Generate store notification item
  if (currentUserId) {
    obraStore.generateNotification({
      userId: currentUserId,
      title,
      message: body,
      type: eventType === 'DOCUMENT_EXPIRING' || eventType === 'DELIVERY_NOTE_DISPUTED' ? 'WARNING' : 'INFO',
      targetEntity: eventType === 'REPORT_SUBMITTED' ? 'DailyReport' : eventType === 'DELIVERY_NOTE_PENDING' ? 'DeliveryNote' : undefined,
      targetId,
    });
  }

  // 2. Dispatch OS-level Web Push Notification if browser permission is granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
        if (registration) {
          registration.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/favicon.svg',
            data: { url: url || '/' },
          });
          return;
        }
      }
      // Fallback to desktop notification constructor
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
      });
    } catch (e) {
      console.warn('[PushNotifications] Local Notification display note:', e);
    }
  }
}
