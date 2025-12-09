import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing market prices with simulated live updates
 * Uses React Query for caching and optimistic updates
 */
export function useMarketPrices() {
  const [prices, setPrices] = useState({
    EURUSD: { bid: 1.09485, ask: 1.09495, spread: 1.0 },
    GBPUSD: { bid: 1.26475, ask: 1.26488, spread: 1.3 },
    USDJPY: { bid: 149.825, ask: 149.845, spread: 2.0 },
    XAUUSD: { bid: 2658.2, ask: 2658.8, spread: 6.0 },
    BTCUSD: { bid: 91250.0, ask: 91280.0, spread: 30.0 },
  });

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const updated = {};
        Object.keys(prev).forEach((symbol) => {
          const change = (Math.random() - 0.5) * 0.0002;
          const newBid = prev[symbol].bid + change;
          const newAsk = newBid + prev[symbol].spread / 10000;
          updated[symbol] = {
            bid: parseFloat(
              newBid.toFixed(symbol === 'XAUUSD' || symbol === 'BTCUSD' ? 2 : 5)
            ),
            ask: parseFloat(
              newAsk.toFixed(symbol === 'XAUUSD' || symbol === 'BTCUSD' ? 2 : 5)
            ),
            spread: prev[symbol].spread,
          };
        });
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return { prices, isLoading: false };
}
