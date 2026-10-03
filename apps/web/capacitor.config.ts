import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.readixon.app',
  appName: 'Readixon',
  webDir: 'public', // Next.js SSR / live URL için public klasörü veya out
  server: {
    url: 'https://www.readixon.com',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [
      'readixon.com',
      '*.readixon.com',
      'www.readixon.com',
      '*.firebaseapp.com',
      '*.googleapis.com',
      'accounts.google.com'
    ]
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0a0a0c',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#4880FF',
      sound: 'default',
    },
  },
};

export default config;
