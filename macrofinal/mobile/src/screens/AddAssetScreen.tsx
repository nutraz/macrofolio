import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddAssetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Asset</Text>
      <Text style={styles.subtitle}>Form coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
