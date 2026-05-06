import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneymanager.app',
  appName: 'Money Manager',
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      // Auto-update: app checks Capgo on launch and applies pending bundles
      autoUpdate: true,
      // Notify Capgo the update succeeded within this many ms, else roll back
      appReadyTimeout: 10000,
    },
  },
};

export default config;
