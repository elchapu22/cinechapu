import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cinechapu.app',
  appName: 'CineChapu',
  webDir: 'public',
  server: {
    url: 'https://cinechapu-chapu1.vercel.app',
    cleartext: true
  }
};

export default config;
