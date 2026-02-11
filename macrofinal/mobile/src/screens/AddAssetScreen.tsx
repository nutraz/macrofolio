import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAssets } from '../context/AssetsContext';
import type { AssetType } from '../types';

const ASSET_TYPES: AssetType[] = ['Stock', 'Crypto', 'Commodity', 'Real Estate'];

const CATEGORY_SUGGESTIONS: Record<AssetType, string[]> = {
  Stock: ['US Equity', 'ETF', 'Index Fund', 'Tech', 'Finance', 'Energy'],
  Crypto: ['Layer 1', 'Layer 2', 'DeFi', 'Meme', 'Stablecoin'],
  Commodity: ['Gold', 'Silver', 'Oil', 'Gas', 'Agriculture'],
  'Real Estate': ['REIT', 'Residential', 'Commercial', 'Land'],
};

function toNumberOrZero(text: string) {
  const n = Number(text);
  return Number.isFinite(n) ? n : 0;
}

export default function AddAssetScreen({ route, navigation }: { route?: any; navigation?: any }) {
  const { addAsset, getAssetById, updateAsset } = useAssets();
  const assetId = route?.params?.assetId as string | undefined;
  const editing = !!assetId;
  const existing = assetId ? getAssetById(assetId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [symbol, setSymbol] = useState(existing?.symbol ?? '');
  const [type, setType] = useState<AssetType>(existing?.type ?? 'Stock');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '1');
  const [price, setPrice] = useState(existing ? String(existing.price) : '0');
  const [changePct, setChangePct] = useState(existing ? String(existing.changePct) : '0');
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const suggestions = useMemo(() => CATEGORY_SUGGESTIONS[type], [type]);

  const onSave = async () => {
    const trimmedName = name.trim();
    const trimmedSymbol = symbol.trim().toUpperCase();

    if (!trimmedName) return Alert.alert('Missing', 'Enter an asset name');
    if (!trimmedSymbol) return Alert.alert('Missing', 'Enter a symbol/ticker');

    const draft = {
      name: trimmedName,
      symbol: trimmedSymbol,
      type,
      category: category.trim() ? category.trim() : undefined,
      amount: toNumberOrZero(amount),
      price: toNumberOrZero(price),
      changePct: toNumberOrZero(changePct),
    };

    try {
      if (editing && assetId) {
        await updateAsset(assetId, draft);
        Alert.alert('Saved', `${trimmedSymbol} updated.`);
      } else {
        await addAsset(draft);
        Alert.alert('Added', `${trimmedSymbol} added to your portfolio.`);
      }

      if (!editing) {
        setName('');
        setSymbol('');
        setType('Stock');
        setCategory('');
        setAmount('1');
        setPrice('0');
        setChangePct('0');
      }

      if (navigation?.navigate) navigation.navigate('Portfolio');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Try again');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{editing ? 'Edit Asset' : 'Add New Asset'}</Text>

      <Text style={styles.label}>Asset class</Text>
      <TouchableOpacity style={styles.select} onPress={() => setTypePickerOpen(true)} accessibilityRole="button">
        <Text style={styles.selectText}>{type}</Text>
        <Text style={styles.selectChevron}>▾</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Apple Inc."
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={(v) => {
          setName(v);
          if (!symbol.trim()) setSymbol(v.trim().slice(0, 6).toUpperCase());
        }}
      />

      <Text style={styles.label}>Symbol / ticker</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., AAPL / BTC"
        placeholderTextColor="#94a3b8"
        value={symbol}
        onChangeText={setSymbol}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Category (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Pick one below or type your own"
        placeholderTextColor="#94a3b8"
        value={category}
        onChangeText={setCategory}
      />

      <View style={styles.suggestions}>
        {suggestions.map((s) => (
          <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => setCategory(s)}>
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor="#94a3b8"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Price (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#94a3b8"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Daily change % (manual)</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        placeholderTextColor="#94a3b8"
        value={changePct}
        onChangeText={setChangePct}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
        <Text style={styles.primaryButtonText}>{editing ? 'Save Changes' : 'Add Asset'}</Text>
      </TouchableOpacity>

      <Modal visible={typePickerOpen} transparent animationType="fade" onRequestClose={() => setTypePickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setTypePickerOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose asset class</Text>
            {ASSET_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.modalOption, t === type && styles.modalOptionActive]}
                onPress={() => {
                  setType(t);
                  setTypePickerOpen(false);
                }}
              >
                <Text style={styles.modalOptionText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 18 },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  selectText: { color: '#ffffff', fontWeight: '700' },
  selectChevron: { color: '#94a3b8', fontSize: 16, marginLeft: 10 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  suggestionChip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: { color: '#cbd5e1', fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '800' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0b1220',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
  },
  modalTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 10 },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
    backgroundColor: '#0f172a',
  },
  modalOptionActive: { borderColor: '#6366f1' },
  modalOptionText: { color: '#ffffff', fontWeight: '700' },
});
