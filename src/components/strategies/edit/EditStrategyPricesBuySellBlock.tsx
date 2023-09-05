import { FC } from 'react';
import { Token } from 'libs/tokens';
import { LimitRangeSection } from 'components/strategies/create/BuySellBlock/LimitRangeSection';
import { OrderCreate } from 'components/strategies/create/useOrder';
import { EditTypes } from './EditStrategyMain';
import { EditStrategyAllocatedBudget } from './EditStrategyAllocatedBudget';

type EditStrategyPricesBuySellBlockProps = {
  base: Token;
  quote: Token;
  order: OrderCreate;
  balance?: string;
  buy?: boolean;
  type: EditTypes;
  isOrdersOverlap: boolean;
};

export const EditStrategyPricesBuySellBlock: FC<
  EditStrategyPricesBuySellBlockProps
> = ({ base, quote, balance, buy, order, type, isOrdersOverlap }) => {
  return (
    <div
      className={`bg-secondary w-full rounded-6 border-l-2 p-20 text-12 ${
        buy
          ? 'border-green/50 focus-within:border-green'
          : 'border-red/50 focus-within:border-red'
      }`}
    >
      <LimitRangeSection
        {...{
          base,
          quote,
          balance,
          buy,
          order,
          isOrdersOverlap,
          isEdit: true,
          title: `${buy ? 'Buy' : 'Sell'} ${buy ? 'Low' : 'High'} ${
            base.symbol
          }`,
          inputTitle: (
            <div className="text-white/60">
              {`Set ${buy ? 'Buy' : 'Sell'} Price `}
              <span className={'text-white/80'}>
                ({quote.symbol} <span className="text-white/60">per 1 </span>
                {base.symbol})
              </span>
            </div>
          ),
        }}
      />
      <div className="pt-10">
        <EditStrategyAllocatedBudget
          {...{
            order,
            base,
            quote,
            balance,
            buy,
            type,
          }}
        />
      </div>
    </div>
  );
};
