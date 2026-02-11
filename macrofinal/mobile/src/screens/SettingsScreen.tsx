import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import DemoPaywallModal from '../components/DemoPaywallModal';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { loading, isPremium, revenueCatEnabled, error, purchaseFirstPackage, restore, refresh, setPremiumOverrideForDemo } =
    usePremium();
  const [demoPaywallOpen, setDemoPaywallOpen] = useState(false);

  const handlePurchase = async () => {
    try {
      await purchaseFirstPackage();
      await refresh();
      Alert.alert('Success', 'Premium status updated.');
    } catch (e: any) {
      Alert.alert('Purchase failed', e?.message || 'Try again');
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      await refresh();
      Alert.alert('Restored', 'Purchase restoration complete.');
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message || 'Try again');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e: any) {
      Alert.alert('Sign out failed', e?.message || 'Try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.rowLabel}>Signed in</Text>
      <Text style={styles.rowValue}>
        {user?.method === 'wallet' ? user.walletAddress : user?.email}
      </Text>
      <Text style={styles.hint}>Method: {user?.method}</Text>

      <Text style={[styles.rowLabel, { marginTop: 18 }]}>Subscription</Text>
      <Text style={styles.rowValue}>
        {loading ? 'Checking…' : isPremium ? 'Premium active' : 'Free'}
      </Text>
      {error ? <Text style={styles.hint}>RevenueCat: {error}</Text> : null}
      {!revenueCatEnabled ? (
        <Text style={styles.hint}>
          Set `REVENUECAT_ANDROID_API_KEY` / `REVENUECAT_IOS_API_KEY` in `src/config/revenuecat.ts`.
        </Text>
      ) : null}

      <View style={styles.buttonRow}>
        <Button title="Upgrade to Premium" onPress={handlePurchase} disabled={!revenueCatEnabled || loading || isPremium} />
      </View>
      {!revenueCatEnabled ? (
        <View style={styles.buttonRow}>
          <Button title="Show Demo Paywall (Judges)" onPress={() => setDemoPaywallOpen(true)} />
        </View>
      ) : null}
      <View style={styles.buttonRow}>
        <Button title="Restore Purchases" onPress={handleRestore} disabled={!revenueCatEnabled || loading} />
      </View>

      <View style={[styles.buttonRow, { marginTop: 18 }]}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>

      <DemoPaywallModal
        visible={demoPaywallOpen}
        onClose={() => setDemoPaywallOpen(false)}
        onContinue={() => {
          setPremiumOverrideForDemo(true);
          setDemoPaywallOpen(false);
          Alert.alert('Demo', 'Premium unlocked (demo mode).');
        }}
        onRestore={() => {
          setPremiumOverrideForDemo(true);
          setDemoPaywallOpen(false);
          Alert.alert('Demo', 'Purchases restored (demo mode).');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f172a' },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  rowLabel: { color: '#94a3b8', fontSize: 13 },
  rowValue: { color: '#ffffff', marginTop: 4 },
  hint: { color: '#64748b', marginTop: 10, fontSize: 12, lineHeight: 16 },
  buttonRow: { marginTop: 12 },
});
