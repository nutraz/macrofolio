#!/bin/bash
echo "🔧 Configuring Android build..."

cd macrofolio/src/macrofolio_assets

# Update capacitor.config.ts for production
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.macrofolio.app',
  appName: 'Macrofolio',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://macrofolio.vercel.app',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: './android/app/macrofolio.keystore',
      keystoreAlias: 'macrofolio'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#3b82f6"
    }
  }
};

export default config;
EOF

echo "✅ Android configuration updated"
