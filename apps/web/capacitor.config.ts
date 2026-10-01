import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.readixon.app',
  appName: 'Readixon',
  webDir: 'public', // Next.js SSR / live URL için public klasörü veya out
  server: {
    url: 'https://readixon.com',
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
    // Gelecekte eklenecek push notification veya splash screen ayarları buraya gelecektir
  }
};

export default config;
