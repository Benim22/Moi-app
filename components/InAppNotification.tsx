import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '@/constants/theme';
import { X, CheckCircle, AlertCircle, Info, Gift } from 'lucide-react-native';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'promo';

interface InAppNotificationProps {
  visible: boolean;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export default function InAppNotification({
  visible,
  type,
  title,
  message,
  duration = 5000,
  onDismiss,
  action
}: InAppNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animera in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss efter duration
      const timer = setTimeout(() => {
        dismissNotification();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      dismissNotification();
    }
  }, [visible, duration]);

  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          borderColor: '#45a049',
          icon: CheckCircle,
        };
      case 'error':
        return {
          backgroundColor: '#f44336',
          borderColor: '#da190b',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          backgroundColor: '#ff9800',
          borderColor: '#e68900',
          icon: AlertCircle,
        };
      case 'promo':
        return {
          backgroundColor: theme.colors.gold,
          borderColor: '#e6c200',
          icon: Gift,
        };
      default: // info
        return {
          backgroundColor: '#2196F3',
          borderColor: '#1976D2',
          icon: Info,
        };
    }
  };

  const notificationStyle = getNotificationStyle();
  const IconComponent = notificationStyle.icon;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: notificationStyle.backgroundColor,
          borderColor: notificationStyle.borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconComponent size={24} color="#fff" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={dismissNotification}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Under status bar och header
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 