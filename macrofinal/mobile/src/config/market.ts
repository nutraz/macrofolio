export const MARKET_TICKER_SYMBOLS = ['^GSPC', '^IXIC', '^DJI', 'BTC-USD', 'ETH-USD'] as const;

export const MARKET_TICKER_LABELS: Record<string, string> = {
  '^GSPC': 'S&P 500',
  '^IXIC': 'NASDAQ 100',
  '^DJI': 'DOW',
  'BTC-USD': 'BTC',
  'ETH-USD': 'ETH',
};

export const MARKET_TICKER_REFRESH_MS = 30_000;
