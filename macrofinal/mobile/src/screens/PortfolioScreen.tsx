import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAssets } from '../context/AssetsContext';
import MarketTicker from '../components/MarketTicker';
import type { Asset, AssetType } from '../types';

type Props = {
  navigation: any;
};

export default function PortfolioScreen({ navigation }: Props) {
  const { assets, loading, deleteAsset } = useAssets();

  const { totalValue, totalDollarChange } = useMemo(() => {
    const tv = assets.reduce((sum, asset) => sum + asset.amount * asset.price, 0);
    const td = assets.reduce(
      (sum, asset) => sum + (asset.changePct * (asset.amount * asset.price)) / 100,
      0,
    );
    return { totalValue: tv, totalDollarChange: td };
  }, [assets]);

  const onDelete = (asset: Asset) => {
    Alert.alert('Delete Asset', `Remove ${asset.symbol}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteAsset(asset.id);
        },
      },
    ]);
  };

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <View style={styles.assetCard}>
      <View style={styles.assetHeader}>
        <View
          style={[
            styles.assetIcon,
            { backgroundColor: getAssetColor(item.type) },
          ]}
        >
          <Ionicons
            name={getAssetIconName(item.type)}
            size={24}
            color="#fff"
          />
        </View>
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{item.name}</Text>
          <Text style={styles.assetSymbol}>
            {item.symbol} - {item.type}
            {item.category ? ` • ${item.category}` : ''}
          </Text>
        </View>
        <View style={styles.assetValue}>
          <Text style={styles.assetPrice}>${(item.amount * item.price).toFixed(2)}</Text>
          <Text
            style={[
              styles.assetChange,
              { color: item.changePct >= 0 ? '#10b981' : '#ef4444' },
            ]}
          >
            {item.changePct >= 0 ? '+' : ''}{item.changePct}%
          </Text>
        </View>
        <TouchableOpacity
          accessibilityLabel={`Edit ${item.symbol}`}
          style={styles.iconButton}
          onPress={() => navigation.navigate('Add', { assetId: item.id })}
        >
          <Ionicons name="create-outline" size={18} color="#94a3b8" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={`Delete ${item.symbol}`}
          style={styles.iconButton}
          onPress={() => onDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <MarketTicker />
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
        <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
        <View style={styles.changeRow}>
          <Text
            style={[
              styles.changeText,
              { color: totalDollarChange >= 0 ? '#10b981' : '#ef4444' },
            ]}
          >
            {totalDollarChange >= 0 ? '+' : ''}${Math.abs(totalDollarChange).toFixed(2)} today
          </Text>
          <Ionicons
            name={totalDollarChange >= 0 ? 'trending-up' : 'trending-down'}
            size={20}
            color={totalDollarChange >= 0 ? '#10b981' : '#ef4444'}
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{assets.length}</Text>
          <Text style={styles.statLabel}>Assets</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {new Set(assets.map((a) => a.type)).size}
          </Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>
            {assets.filter((a) => a.changePct > 0).length}
          </Text>
          <Text style={styles.statLabel}>Gaining</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Assets</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Add')}>
          <Text style={styles.seeAllText}>Add -{'>'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : assets.length === 0 ? (
        <Text style={styles.emptyText}>
          No assets yet. Tap “Add” to create your first holding.
        </Text>
      ) : null}

      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const getAssetIconName = (type: AssetType) => {
  switch (type) {
    case 'Stock':
      return 'trending-up';
    case 'Crypto':
      return 'logo-bitcoin';
    case 'Commodity':
      return 'diamond';
    case 'Real Estate':
      return 'business';
    default:
      return 'wallet';
  }
};

const getAssetColor = (type: AssetType) => {
  switch (type) {
    case 'Stock':
      return '#3b82f6';
    case 'Crypto':
      return '#f59e0b';
    case 'Commodity':
      return '#10b981';
    case 'Real Estate':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  assetCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  assetSymbol: {
    color: '#94a3b8',
    fontSize: 14,
  },
  assetValue: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  assetPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  assetChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    paddingVertical: 12,
  },
});
