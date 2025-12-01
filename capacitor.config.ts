import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaaysamp.app',
  appName: 'KaaySamp',
  webDir: 'dist',

  ios: {
    contentInset: 'never',
    backgroundColor: '#0a1628',
  },
  android: {
    backgroundColor: '#0a1628',
  },
};

export default config;
