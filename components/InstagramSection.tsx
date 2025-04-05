import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { theme } from '@/constants/theme';
import { ExternalLink, Instagram } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { Linking } from 'react-native';

export default function InstagramSection() {
  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/moisushi.se');
  };

  const ELFSIGHT_EMBED_CODE = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background-color: ${theme.colors.background};
          }
        </style>
      </head>
      <body>
        <script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
        <div class="elfsight-app-4ba0712a-eb22-40e6-a631-0335ffc36416"></div>
      </body>
    </html>
  `;

  const windowHeight = Dimensions.get('window').height;
  const widgetHeight = 400; // Justera höjden efter behov

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Instagram size={24} color="#E1306C" />
        <Text style={styles.title}>@moisushi.se</Text>
      </View>
      <Text style={styles.subtitle}>Följ oss på Instagram</Text>
      
      <View style={[styles.widgetContainer, { height: widgetHeight }]}>
        <WebView
          originWhitelist={['*']}
          source={{ html: ELFSIGHT_EMBED_CODE }}
          style={styles.webview}
          scrollEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
      
      <Pressable style={styles.button} onPress={openInstagram}>
        <Text style={styles.buttonText}>Visa profil</Text>
        <ExternalLink size={16} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.lg,
  },
  widgetContainer: {
    width: '100%',
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    gap: 8,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});