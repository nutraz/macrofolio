import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import { WALLETCONNECT_PROJECT_ID } from '../config/walletconnect';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AUTH_PROVIDERS } from '../config/authProviders';
import { useAuth } from '../context/AuthContext';

const LOGO = require('../assets/logo.png');
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function AuthScreen() {
  const { signInWithEmail, signInWithOAuth, signInWithWallet } = useAuth();
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'pick' | 'email' | 'wallet'>('pick');

  const { open, isConnected, address } = useWalletConnectModal();
  const lastWalletAddressRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    if (lastWalletAddressRef.current === address) return;
    lastWalletAddressRef.current = address;
    signInWithWallet(address).catch(() => {});
  }, [isConnected, address, signInWithWallet]);

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const isTest = typeof process !== 'undefined' && !!(process as any).env?.JEST_WORKER_ID;
    if (isTest) return;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const emailError = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return null;
    const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return basic.test(trimmed) ? null : 'Enter a valid email';
  }, [email]);

  const onContinue = async () => {
    if (emailError) {
      Alert.alert('Invalid email', emailError);
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmail(email);
      Alert.alert('Check your email', 'We sent you a sign-in link.');
    } catch (e: any) {
      Alert.alert('Sign in failed', e?.message || 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  const onSocial = async (provider: 'google' | 'facebook' | 'discord' | 'x' | 'apple') => {
    setSubmitting(true);
    try {
      await signInWithOAuth(provider);
    } catch (e: any) {
      Alert.alert('Sign in failed', e?.message || 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  const onWallet = async () => {
    setSubmitting(true);
    try {
      await signInWithWallet(walletAddress);
    } catch (e: any) {
      Alert.alert('Wallet sign in failed', e?.message || 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  const onWalletConnect = async () => {
    if (!WALLETCONNECT_PROJECT_ID) {
      Alert.alert('WalletConnect not configured', 'Set WALLETCONNECT_PROJECT_ID in src/config/walletconnect.ts');
      return;
    }
    try {
      await open();
    } catch (e: any) {
      Alert.alert('WalletConnect failed', e?.message || 'Try again');
    }
  };

  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const logoOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <AnimatedImage
            source={LOGO}
            resizeMode="contain"
            style={[styles.logoImage, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}
          />
        </View>
        <Text style={styles.subtitle}>Choose a sign-in method</Text>
      </View>

      {mode === 'pick' ? (
        <View style={styles.card}>
          {AUTH_PROVIDERS.apple && Platform.OS === 'ios' ? (
            <TouchableOpacity
              disabled={submitting}
              onPress={() => onSocial('apple')}
              style={[styles.providerButton, submitting && styles.buttonDisabled]}
            >
              <Ionicons name="logo-apple" size={18} color="#ffffff" style={styles.providerIcon} />
              <Text style={styles.providerText}>Continue with Apple</Text>
            </TouchableOpacity>
          ) : null}

          {AUTH_PROVIDERS.google ? (
            <TouchableOpacity
              disabled={submitting}
              onPress={() => onSocial('google')}
              style={[styles.providerButton, submitting && styles.buttonDisabled]}
            >
              <Ionicons name="logo-google" size={18} color="#ffffff" style={styles.providerIcon} />
              <Text style={styles.providerText}>Continue with Google</Text>
            </TouchableOpacity>
          ) : null}

          {AUTH_PROVIDERS.facebook ? (
            <TouchableOpacity
              disabled={submitting}
              onPress={() => onSocial('facebook')}
              style={[styles.providerButton, submitting && styles.buttonDisabled]}
            >
              <Ionicons name="logo-facebook" size={18} color="#ffffff" style={styles.providerIcon} />
              <Text style={styles.providerText}>Continue with Facebook</Text>
            </TouchableOpacity>
          ) : null}

          {AUTH_PROVIDERS.x ? (
            <TouchableOpacity
              disabled={submitting}
              onPress={() => onSocial('x')}
              style={[styles.providerButton, submitting && styles.buttonDisabled]}
            >
              <Ionicons name="logo-twitter" size={18} color="#ffffff" style={styles.providerIcon} />
              <Text style={styles.providerText}>Continue with X</Text>
            </TouchableOpacity>
          ) : null}

          {AUTH_PROVIDERS.discord ? (
            <TouchableOpacity
              disabled={submitting}
              onPress={() => onSocial('discord')}
              style={[styles.providerButton, submitting && styles.buttonDisabled]}
            >
              <Ionicons name="logo-discord" size={18} color="#ffffff" style={styles.providerIcon} />
              <Text style={styles.providerText}>Continue with Discord</Text>
            </TouchableOpacity>
          ) : null}

          {AUTH_PROVIDERS.walletconnect ? (
            <>
              <TouchableOpacity
                disabled={submitting}
                onPress={onWalletConnect}
                style={[styles.providerButton, submitting && styles.buttonDisabled]}
              >
                <Ionicons name="wallet-outline" size={18} color="#ffffff" style={styles.providerIcon} />
                <Text style={styles.providerText}>Web3 Wallet (WalletConnect v2)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={submitting}
                onPress={onWalletConnect}
                style={[styles.providerButton, submitting && styles.buttonDisabled]}
              >
                <Ionicons name="logo-bitcoin" size={18} color="#ffffff" style={styles.providerIcon} />
                <Text style={styles.providerText}>MetaMask</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {AUTH_PROVIDERS.email ? (
            <TouchableOpacity
              disabled={submitting}
              onPress={() => setMode('email')}
              style={[styles.providerButton, submitting && styles.buttonDisabled]}
            >
              <Ionicons name="mail-outline" size={18} color="#ffffff" style={styles.providerIcon} />
              <Text style={styles.providerText}>Continue with Email</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.note}>
            Requires config: set `SUPABASE_URL` / `SUPABASE_ANON_KEY` in `src/config/supabase.ts` and add `macrofolio://auth/callback` to Supabase redirect URLs.
          </Text>
        </View>
      ) : mode === 'email' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
          <TouchableOpacity
            disabled={submitting || !!emailError || email.trim().length === 0}
            onPress={onContinue}
            style={[
              styles.primaryButton,
              (submitting || !!emailError || email.trim().length === 0) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>{submitting ? 'Signing in…' : 'Continue'}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={submitting} onPress={() => setMode('pick')} style={styles.linkButton}>
            <Text style={styles.linkText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wallet</Text>
          <TextInput
            value={walletAddress}
            onChangeText={setWalletAddress}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="0x…"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
          <TouchableOpacity
            disabled={submitting || walletAddress.trim().length === 0}
            onPress={onWallet}
            style={[styles.primaryButton, (submitting || walletAddress.trim().length === 0) && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>{submitting ? 'Connecting…' : 'Continue'}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={submitting} onPress={() => setMode('pick')} style={styles.linkButton}>
            <Text style={styles.linkText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#0f172a' },
  header: { alignItems: 'center', marginBottom: 18 },
  logoWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  subtitle: { color: '#94a3b8', marginTop: 12 },
  card: { backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, padding: 16 },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0b1220',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  providerButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  providerIcon: { marginRight: 10 },
  providerText: { color: '#ffffff', fontWeight: '700' },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  linkButton: { marginTop: 10, alignItems: 'center' },
  linkText: { color: '#94a3b8', fontWeight: '600' },
  note: { color: '#64748b', marginTop: 12, fontSize: 12, lineHeight: 16 },
});
