import { FC } from 'react';
import { OrderCreate } from '../useOrder';
import { InputRange } from '../BuySellBlock/InputRange';
import { Token } from 'libs/tokens';
import { MarketPricePercentage } from 'components/strategies/marketPriceIndication';
import {
  isMaxBelowMarket,
  isMinAboveMarket,
} from 'components/strategies/overlapping/utils';

interface Props {
  base: Token;
  quote: Token;
  order0: OrderCreate;
  order1: OrderCreate;
  marketPricePercentage: MarketPricePercentage;
}

const getPriceWarnings = (isOutOfMarket: boolean): string[] => {
  if (!isOutOfMarket) return [];
  return [
    'Notice: your strategy is “out of the money” and will be traded when the market price moves into your price range.',
  ];
};

export const CreateOverlappingRange: FC<Props> = (props) => {
  const { base, quote, order0, order1, marketPricePercentage } = props;
  const minAboveMarket = isMinAboveMarket(order0);
  const maxBelowMarket = isMaxBelowMarket(order1);

  const priceWarnings = getPriceWarnings(minAboveMarket || maxBelowMarket);

  return (
    <InputRange
      base={base}
      quote={quote}
      min={order0.min}
      max={order1.max}
      setMin={order0.setMin}
      setMax={order1.setMax}
      minLabel="Min Buy Price"
      maxLabel="Max Sell Price"
      error={order0.rangeError}
      setRangeError={order0.setRangeError}
      warnings={priceWarnings}
      marketPricePercentages={marketPricePercentage}
    />
  );
};
