import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MARKET_TICKER_LABELS, MARKET_TICKER_REFRESH_MS, MARKET_TICKER_SYMBOLS } from '../config/market';

type Quote = {
  symbol: string;
  shortName?: string;
  price: number;
  changePct: number;
};

const CACHE_KEY = 'macrofolio.marketTicker.cache.v1';

function formatPrice(symbol: string, price: number) {
  const isCrypto = symbol.endsWith('-USD');
  const decimals = isCrypto ? (price >= 100 ? 0 : 2) : 2;
  return price.toFixed(decimals);
}

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeoutMs = 12_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseStooqCsvRow(csv: string): { open: number; close: number } | null {
  // Example:
  // Symbol,Date,Time,Open,High,Low,Close,Volume
  // ^SPX,2026-02-10,23:00:00,6974.49,6986.83,6937.53,6941.81,3518487068
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return null;
  const row = lines[1];
  const parts = row.split(',');
  // Symbol,Date,Time,Open,High,Low,Close,Volume
  if (parts.length < 8) return null;

  const open = Number(parts[3]);
  const close = Number(parts[6]);
  if (!Number.isFinite(open) || !Number.isFinite(close)) return null;
  return { open, close };
}

async function fetchIndexQuoteFromStooq(stooqSymbol: string, outputSymbol: string): Promise<Quote | null> {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSymbol.toLowerCase())}&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetchWithTimeout(
    url,
    { headers: { Accept: 'text/csv, */*' } },
    12_000,
  );
  if (!res.ok) return null;
  const csv = await res.text();
  const parsed = parseStooqCsvRow(csv);
  if (!parsed) return null;
  const changePct = parsed.open !== 0 ? ((parsed.close - parsed.open) / parsed.open) * 100 : 0;
  return {
    symbol: outputSymbol,
    price: parsed.close,
    changePct: Number.isFinite(changePct) ? changePct : 0,
  };
}

async function fetchCryptoQuotesFromCoinGecko(symbols: string[]): Promise<Quote[]> {
  const ids: string[] = [];
  const map = new Map<string, string>();

  for (const sym of symbols) {
    if (sym === 'BTC-USD') {
      ids.push('bitcoin');
      map.set(sym, 'bitcoin');
    } else if (sym === 'ETH-USD') {
      ids.push('ethereum');
      map.set(sym, 'ethereum');
    }
  }

  if (ids.length === 0) return [];

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    ids.join(','),
  )}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetchWithTimeout(
    url,
    { headers: { Accept: 'application/json' } },
    12_000,
  );
  if (!res.ok) return [];
  const json = (await res.json()) as any;

  const out: Quote[] = [];
  for (const [sym, id] of map.entries()) {
    const price = Number(json?.[id]?.usd);
    const changePct = Number(json?.[id]?.usd_24h_change ?? 0);
    if (!Number.isFinite(price) || !Number.isFinite(changePct)) continue;
    out.push({ symbol: sym, price, changePct });
  }
  return out;
}

async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  // Yahoo endpoints often return 401/blocked in mobile networks.
  // Use Stooq (indices) + CoinGecko (crypto) as no-key sources.
  const out: Quote[] = [];

  const indexFetches: Promise<Quote | null>[] = [];
  for (const symbol of symbols) {
    if (symbol === '^GSPC') indexFetches.push(fetchIndexQuoteFromStooq('^SPX', symbol));
    else if (symbol === '^IXIC') indexFetches.push(fetchIndexQuoteFromStooq('^NDX', symbol));
    else if (symbol === '^DJI') indexFetches.push(fetchIndexQuoteFromStooq('^DJI', symbol));
  }

  const [indexResults, cryptoResults] = await Promise.all([
    Promise.all(indexFetches),
    fetchCryptoQuotesFromCoinGecko(symbols),
  ]);

  for (const q of indexResults) if (q) out.push(q);
  out.push(...cryptoResults);

  return out;
}

export default function MarketTicker({
  symbols = [...MARKET_TICKER_SYMBOLS],
  refreshMs = MARKET_TICKER_REFRESH_MS,
}: {
  symbols?: string[];
  refreshMs?: number;
}) {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const labels = useMemo(() => MARKET_TICKER_LABELS, []);

  useEffect(() => {
    let mounted = true;
    let timer: any;

    const loadCache = async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as { quotes?: unknown };
        if (!mounted) return;
        if (Array.isArray(parsed.quotes)) {
          const cached = parsed.quotes as Quote[];
          if (cached.length > 0) setQuotes(cached);
        }
      } catch {
        // ignore cache errors
      }
    };

    const run = async () => {
      try {
        const net = await NetInfo.fetch();
        const isOffline = !(net.isConnected && net.isInternetReachable !== false);
        if (!mounted) return;
        setOffline(isOffline);
        if (isOffline) {
          setError(quotes && quotes.length > 0 ? 'Offline (showing last prices)' : 'Offline');
          return;
        }

        const data = await fetchQuotes(symbols);
        if (!mounted) return;
        if (data.length === 0) {
          setError(quotes && quotes.length > 0 ? 'Markets unavailable (showing last prices)' : 'Markets unavailable');
          return;
        }
        setQuotes(data);
        setError(null);

        AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), quotes: data })).catch(() => {});
      } catch (e: any) {
        if (!mounted) return;
        const msg = e?.name === 'AbortError' ? 'Network timeout' : e?.message || 'Network failed';
        setError(quotes && quotes.length > 0 ? `${msg} (showing last prices)` : msg);
      }
    };

    loadCache().finally(() => run());
    timer = setInterval(run, refreshMs);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [symbols, refreshMs, quotes]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {quotes === null && !error ? (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading markets…</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{offline ? 'Markets (offline): ' : 'Markets: '}{error}</Text> : null}

        {(quotes ?? []).map((q) => {
          const label = labels[q.symbol] ?? q.shortName ?? q.symbol;
          const positive = q.changePct >= 0;
          return (
            <View key={q.symbol} style={styles.chip}>
              <Text style={styles.chipLabel}>{label}</Text>
              <Text style={styles.chipPrice}>${formatPrice(q.symbol, q.price)}</Text>
              <Text style={[styles.chipChange, { color: positive ? '#10b981' : '#ef4444' }]}>
                {positive ? '+' : ''}
                {q.changePct.toFixed(2)}%
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  content: { paddingHorizontal: 10, alignItems: 'center' },
  loading: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  loadingText: { color: '#94a3b8', marginLeft: 10 },
  errorText: { color: '#ef4444', paddingHorizontal: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 999,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipLabel: { color: '#94a3b8', fontSize: 12, marginRight: 10 },
  chipPrice: { color: '#ffffff', fontWeight: '700', marginRight: 10 },
  chipChange: { fontWeight: '700' },
});
