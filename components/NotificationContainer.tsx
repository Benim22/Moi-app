import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNotificationStore } from '@/store/notification-store';
import InAppNotification from './InAppNotification';

export default function NotificationContainer() {
  const { notifications, dismissNotification } = useNotificationStore();

  return (
    <View style={styles.container}>
      {notifications.map((notification, index) => (
        <View key={notification.id} style={[styles.notificationWrapper, { top: 60 + (index * 80) }]}>
          <InAppNotification
            visible={notification.visible}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            action={notification.action}
            onDismiss={() => dismissNotification(notification.id)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  notificationWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
}); 