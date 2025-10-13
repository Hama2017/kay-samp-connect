import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaaysamp.app',
  appName: 'KaaySamp',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.124:8080', // ← ton serveur local
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
