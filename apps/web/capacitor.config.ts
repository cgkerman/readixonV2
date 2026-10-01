import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.readixon.app',
  appName: 'Readixon',
  webDir: 'public', // Next.js SSR / live URL için public klasörü veya out
  server: {
    // Canlı web sitenizin adresi (Capacitor Next.js SSR sayfalarınızı ve API'larınızı doğrudan buradan çeker)
    // Yerel testlerde 'http://10.0.2.2:3000' (Android emulator) veya LAN IP'nizi kullanabilirsiniz.
    url: process.env.CAPACITOR_SERVER_URL || 'https://readixon.com',
    cleartext: true,
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
