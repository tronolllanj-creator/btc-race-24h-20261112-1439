# Momentum Rider Bot

## Strategy
The momentum-rider strategy captures trending market movements by buying assets showing strong upward price momentum and selling or shorting when momentum reverses, using moving average crossovers and rate-of-change indicators.

## Protocol Overview
- **hello**: Initial handshake establishing connection and configuration.
- **batch**: Groups multiple messages or ticks together for efficient processing.
- **orders**: Submits buy/sell instructions based on strategy signals.
- **bar**: Delivers historical or real-time OHLCV candle data to update indicators.

## Local Grading
Test and evaluate your bot locally against historical data using the kit's CLI:

```bash
python -m kit.cli grade-local --strategy momentum-rider
```