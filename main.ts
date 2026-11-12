// Buys on a 30-bar momentum burst of at least 30 bps and exits on an 80 bps profit target,
// an 80 bps trailing stop, or a 100 bps hard stop, with at most one round trip.

import { BPS, runBars, type BarsState, type BuyInput, type OrderInput } from './vendor/makefun-bars.ts';

const closes: bigint[] = [];
let peak: bigint | null = null;
let trades = 0;

await runBars({
  onBatch(state: BarsState, batch: unknown[]): OrderInput[] {
    const close = state.close('CBBTC');
    if (close !== null) {
      closes.push(close);
    }

    const orders: OrderInput[] = [];
    const symbol = 'CBBTC';
    const held = state.positions.get(symbol);

    if (held && close !== null) {
      if (peak === null || close > peak) {
        peak = close;
      }
      const val = state.value(symbol, held.qty);
      const cost = held.cost;
      const minNotional = BigInt(state.hello.fees.min_notional_quote_units);

      const takeProfit = val * 1000n >= cost * 1008n;
      const trailingStop = peak !== null && close * 1000n <= peak * 992n;
      const hardStop = val * 100n <= cost * 99n;

      if (takeProfit || trailingStop || hardStop) {
        orders.push({
          side: 'sell',
          symbol,
          qty: held.qty,
          max_slippage_bps: 100,
        });
        trades += 1;
        peak = null;
      }
    } else {
      if (!state.warmingUp && trades < 2 && closes.length >= 31 && close !== null) {
        const currentClose = closes[closes.length - 1];
        const pastClose = closes[closes.length - 31];
        if (currentClose * 10000n >= pastClose * 10030n) {
          const maxSpend = state.weightRoom(symbol);
          let notional = state.cash;
          if (maxSpend < notional) {
            notional = maxSpend;
          }
          const minNotional = BigInt(state.hello.fees.min_notional_quote_units);
          if (notional >= minNotional) {
            orders.push({
              side: 'buy',
              symbol,
              notional_quote_units: notional,
              max_slippage_bps: 100,
            });
            peak = currentClose;
            trades += 1;
          }
        }
      }
    }

    return orders;
  },
});
