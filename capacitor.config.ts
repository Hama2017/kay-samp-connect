import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaaysamp.app',
  appName: 'KaaySamp',
  webDir: 'dist',
  server: {
    url: 'http://169.254.86.155:8080',
    cleartext: true
  },
  ios: {
    contentInset: 'never', // Désactive les insets automatiques
    backgroundColor: '#0a1628' // Couleur dark mode du design system
  },
  android: {
    backgroundColor: '#0a1628'
  }
};

export default config;
