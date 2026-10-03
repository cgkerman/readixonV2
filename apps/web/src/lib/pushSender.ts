import { getAdminDb, getAdminMessaging } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  route?: string;
}

/**
 * Sends a high-priority FCM Push Notification to all active devices of a given user.
 * Automatically cleans up invalid or expired registration tokens.
 */
export async function sendPushNotification({ userId, title, body, data = {}, route }: PushPayload) {
  if (!userId) return null;

  try {
    const adminDb = getAdminDb();
    const userDocRef = adminDb.collection('users').doc(userId);
    const userSnap = await userDocRef.get();

    if (!userSnap.exists) return null;

    const userData = userSnap.data();
    const fcmTokens: string[] = userData?.fcmTokens || [];

    if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
      return null;
    }

    const messaging = getAdminMessaging();

    const safeData: Record<string, string> = {
      title,
      body,
      route: route || '/notifications',
    };

    if (data) {
      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined && val !== null) {
          safeData[key] = String(val);
        }
      }
    }

    const response = await messaging.sendEachForMulticast({
      tokens: fcmTokens,
      notification: {
        title,
        body,
      },
      data: safeData,
      android: {
        priority: 'high',
        notification: {
          channelId: 'readixon_alerts',
          icon: 'ic_notification',
          color: '#4880FF',
          sound: 'default',
          priority: 'high',
          visibility: 'public',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
    });

    // Clean up expired or unregistered FCM tokens
    const tokensToRemove: string[] = [];
    response.responses.forEach((resp, index) => {
      if (!resp.success && resp.error) {
        const errorCode = resp.error.code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          tokensToRemove.push(fcmTokens[index]);
        }
      }
    });

    if (tokensToRemove.length > 0) {
      await userDocRef.update({
        fcmTokens: FieldValue.arrayRemove(...tokensToRemove),
      });
    }

    return response;
  } catch (err) {
    console.error('[FCM] Push bildirimi gönderilirken hata oluştu:', err);
    return null;
  }
}
