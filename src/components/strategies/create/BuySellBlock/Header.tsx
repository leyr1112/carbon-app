import { FC, ReactNode } from 'react';
import { useModal } from 'hooks/useModal';
import { OrderCreate } from '../useOrder';
import { lsService } from 'services/localeStorage';
import { Tooltip } from 'components/common/tooltip/Tooltip';
import { Token } from 'libs/tokens';

interface Props {
  children: ReactNode;
  order: OrderCreate;
  base: Token;
  buy?: boolean;
}

export const BuySellHeader: FC<Props> = (props) => {
  const { order, buy, children, base } = props;
  const { openModal } = useModal();
  const { isRange, setIsRange, resetFields } = order;
  const handleRangeChange = () => {
    if (!lsService.getItem('hasSeenCreateStratExpertMode')) {
      openModal('createStratExpertMode', {
        onConfirm: () => {
          setIsRange(!isRange);
          resetFields(true);
        },
      });
    } else {
      setIsRange(!isRange);
      resetFields(true);
    }
  };
  return (
    <header className="flex items-center justify-between">
      {children}
      <div className="flex items-center gap-10 text-14">
        <div className="bg-body flex items-center rounded-[100px] p-2">
          <button
            type="button"
            tabIndex={!isRange ? -1 : 0}
            onClick={() => handleRangeChange()}
            className={`rounded-40 font-weight-500 ${
              !isRange ? 'bg-silver' : 'text-secondary'
            } px-10 py-4`}
          >
            Limit
          </button>
          <button
            type="button"
            tabIndex={isRange ? -1 : 0}
            onClick={() => handleRangeChange()}
            className={`rounded-40 font-weight-500 ${
              isRange ? 'bg-silver' : 'text-secondary'
            } px-10 py-4`}
          >
            Range
          </button>
        </div>
        <Tooltip
          sendEventOnMount={{ buy }}
          element={
            <>
              This section will define the order details in which you are
              willing to {buy ? 'buy' : 'sell'} {base.symbol} at.
              <br />
              <b>Limit</b> will allow you to define a specific price point to{' '}
              {buy ? 'buy' : 'sell'} the token at.
              <br />
              <b>Range</b> will allow you to define a range of prices to{' '}
              {buy ? 'buy' : 'sell'} the token at.
            </>
          }
        />
      </div>
    </header>
  );
};