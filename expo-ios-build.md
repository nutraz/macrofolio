# iOS Build via Expo

Since you're on Linux, use Expo's cloud build service:

1. **Install Expo CLI**:
   ```bash
   npm install -g expo-cli
   ```

2. **Create Expo project**:
   ```bash
   expo init MacrofolioMobile
   cd MacrofolioMobile
   ```

3. **Copy your React components** from `src/` to Expo project

4. **Install RevenueCat Expo SDK**:
   ```bash
   expo install @revenuecat/purchases-expo
   ```

5. **Configure eas.json**:
   ```json
   {
     "build": {
       "production": {
         "ios": {
           "simulator": false
         }
       }
     }
   }
   ```

6. **Build in cloud**:
   ```bash
   eas build --platform ios --profile production
   ```

7. **Submit to TestFlight** via Expo Dashboard
