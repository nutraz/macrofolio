import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LOGO = require('../assets/logo.png');

export default function DemoPaywallModal({
  visible,
  onClose,
  onContinue,
  onRestore,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  onRestore: () => void;
}) {
  const features = useMemo(
    () => [
      'Unified portfolio dashboard',
      'Real-time market data',
      'Advanced performance analytics',
      'Custom price & news alerts',
      'Export reports & device sync',
    ],
    [],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <TouchableOpacity accessibilityLabel="Close paywall" style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={18} color="#e2e8f0" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.logoWrap}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={styles.title}>Unlock macrofolio Pro</Text>
            <Text style={styles.subtitle}>RevenueCat paywall (demo)</Text>

            <View style={styles.featureList}>
              {features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <View style={styles.check}>
                    <Ionicons name="checkmark" size={14} color="#0b1220" />
                  </View>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <View style={styles.rating}>
              <Text style={styles.ratingText}>4.9 stars</Text>
              <Text style={styles.ratingSub}>1,000+ reviews</Text>
            </View>

            <View style={styles.option}>
              <View style={styles.optionDotActive} />
              <View style={styles.optionBody}>
                <Text style={styles.optionTitle}>Month</Text>
                <Text style={styles.optionSub}>Only $9.99/mo</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionPrice}>$9.99</Text>
                <Text style={styles.optionPer}>/mo</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>19% OFF</Text>
              </View>
            </View>

            <View style={styles.optionInactive}>
              <View style={styles.optionDotInactive} />
              <View style={styles.optionBody}>
                <Text style={styles.optionTitle}>Month</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionPrice}>$9.99</Text>
                <Text style={styles.optionPer}>/mo</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primary} onPress={onContinue}>
              <Text style={styles.primaryText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <TouchableOpacity onPress={onRestore}>
                <Text style={styles.footerLink}>Restore Purchases</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Terms</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <Text style={styles.footerLink}>Privacy</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.note}>
              Demo mode: this screen mimics the RevenueCat paywall design so you can present the flow to judges/sponsors
              without needing Google Play Billing to be fully wired for this build.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', justifyContent: 'center', padding: 18 },
  card: {
    backgroundColor: '#071224',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    maxHeight: '88%',
  },
  close: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  content: { padding: 18, paddingTop: 24, paddingBottom: 20 },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 64, height: 64, borderRadius: 14 },
  title: { color: '#ffffff', fontWeight: '900', fontSize: 22, textAlign: 'center' },
  subtitle: { color: '#94a3b8', textAlign: 'center', marginTop: 6, fontSize: 12 },
  featureList: { marginTop: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  featureText: { color: '#cbd5e1', fontSize: 13, flex: 1 },
  rating: { alignItems: 'center', marginTop: 10, marginBottom: 12 },
  ratingText: { color: '#e2e8f0', fontWeight: '800' },
  ratingSub: { color: '#94a3b8', marginTop: 2, fontSize: 12 },
  option: {
    backgroundColor: '#0b1b33',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  optionInactive: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionDotActive: { width: 16, height: 16, borderRadius: 999, backgroundColor: '#38bdf8', marginRight: 12 },
  optionDotInactive: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#64748b',
    marginRight: 12,
  },
  optionBody: { flex: 1 },
  optionTitle: { color: '#ffffff', fontWeight: '900' },
  optionSub: { color: '#94a3b8', marginTop: 2, fontSize: 12 },
  optionRight: { alignItems: 'flex-end' },
  optionPrice: { color: '#ffffff', fontWeight: '900' },
  optionPer: { color: '#94a3b8', marginTop: 1, fontSize: 12 },
  badge: {
    position: 'absolute',
    right: 10,
    top: -10,
    backgroundColor: '#f472b6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  badgeText: { color: '#0b1220', fontWeight: '900', fontSize: 11 },
  primary: {
    backgroundColor: '#0ea5e9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#ffffff', fontWeight: '900', fontSize: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  footerLink: { color: '#cbd5e1', fontSize: 12 },
  note: { color: '#64748b', fontSize: 11, marginTop: 14, lineHeight: 15 },
});

