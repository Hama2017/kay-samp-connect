import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaaysamp.app',
  appName: 'KaaySamp',
  webDir: 'dist',
  server: {
    url: 'https://f0d266d3-11b2-4338-a868-e07b1e2aa7d3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#ffffff'
  },
  android: {
    backgroundColor: '#ffffff'
  }
};

export default config;
