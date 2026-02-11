import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { usePremium } from '../context/PremiumContext';
import DemoPaywallModal from '../components/DemoPaywallModal';

export default function AnalyticsScreen() {
  const { loading, isPremium, revenueCatEnabled, setPremiumOverrideForDemo } = usePremium();
  const [demoPaywallOpen, setDemoPaywallOpen] = useState(false);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.text}>Loading subscription status…</Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Premium Analytics</Text>
        <Text style={styles.text}>Unlock with a RevenueCat subscription.</Text>
        {!revenueCatEnabled ? (
          <View style={{ marginTop: 16, width: 220 }}>
            <Button title="Show Demo Paywall" onPress={() => setDemoPaywallOpen(true)} />
          </View>
        ) : null}

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Analytics</Text>
      <Text style={styles.text}>You’re premium. (Hook real analytics here.)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  text: { color: '#94a3b8', marginTop: 16 },
});
