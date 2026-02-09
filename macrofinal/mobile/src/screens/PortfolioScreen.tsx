import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const mockAssets = [
  { id: '1', name: 'Apple Stock', symbol: 'AAPL', type: 'Stock', amount: 10, price: 185.2, change: 0.8 },
  { id: '2', name: 'Bitcoin', symbol: 'BTC', type: 'Crypto', amount: 0.5, price: 34505.5, change: 2.5 },
  { id: '3', name: 'Gold ETF', symbol: 'GLD', type: 'Commodity', amount: 15, price: 189.45, change: 0.3 },
];

export default function PortfolioScreen() {
  const [assets] = useState(mockAssets);

  const totalValue = assets.reduce((sum, asset) => sum + (asset.amount * asset.price), 0);
  const totalChange = assets.reduce(
    (sum, asset) => sum + (asset.change * (asset.amount * asset.price) / 100),
    0,
  );

  const renderAssetItem = ({ item }: { item: (typeof mockAssets)[number] }) => (
    <View style={styles.assetCard}>
      <View style={styles.assetHeader}>
        <View style={[styles.assetIcon, { backgroundColor: getAssetColor(item.type) }]}>
          <Ionicons
            name={getAssetIconName(item.type)}
            size={24}
            color="#fff"
          />
        </View>
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{item.name}</Text>
          <Text style={styles.assetSymbol}>{item.symbol} - {item.type}</Text>
        </View>
        <View style={styles.assetValue}>
          <Text style={styles.assetPrice}>${(item.amount * item.price).toFixed(2)}</Text>
          <Text style={[styles.assetChange, { color: item.change >= 0 ? '#10b981' : '#ef4444' }]}>
            {item.change >= 0 ? '+' : ''}{item.change}%
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
        <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
        <View style={styles.changeRow}>
          <Text style={[styles.changeText, { color: totalChange >= 0 ? '#10b981' : '#ef4444' }]}>
            {totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toFixed(2)} today
          </Text>
          <Ionicons
            name={totalChange >= 0 ? 'trending-up' : 'trending-down'}
            size={20}
            color={totalChange >= 0 ? '#10b981' : '#ef4444'}
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
            {assets.filter((a) => a.change > 0).length}
          </Text>
          <Text style={styles.statLabel}>Gaining</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Assets</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All -></Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const getAssetIconName = (type: string) => {
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

const getAssetColor = (type: string) => {
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
});
