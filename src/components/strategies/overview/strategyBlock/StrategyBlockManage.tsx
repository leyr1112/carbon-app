import { FC } from 'react';
import { DropdownMenu } from 'components/common/dropdownMenu';
import { Button } from 'components/common/button';
import { ReactComponent as IconChevron } from 'assets/icons/chevron.svg';
import { useDuplicateStrategy } from 'components/strategies/create/useDuplicateStrategy';
import { Strategy, StrategyStatus } from 'libs/queries';
import { useModal } from 'hooks/useModal';
import { Tooltip } from 'components/common/tooltip/Tooltip';
import { getTooltipTextByItemId } from './utils';

export enum ItemId {
  WithdrawFunds,
  DuplicateStrategy,
  DeleteStrategy,
  PauseStrategy,
  RenewStrategy,
  ChangeRates,
}

type itemsType = {
  id: ItemId;
  name: string;
  action?: () => void;
};

export const StrategyBlockManage: FC<{
  strategy: Strategy;
  manage: boolean;
  setManage: (flag: boolean) => void;
}> = ({ strategy, manage, setManage }) => {
  const { duplicate } = useDuplicateStrategy();
  const { openModal } = useModal();

  const items: itemsType[] = [
    {
      id: ItemId.DuplicateStrategy,
      name: 'Duplicate Strategy',
      action: () => duplicate(strategy),
    },
    {
      id: ItemId.DeleteStrategy,
      name: 'Delete Strategy',
      action: () => openModal('confirmStrategy', { strategy, type: 'delete' }),
    },
    {
      id: ItemId.ChangeRates,
      name: 'Change Rates',
      action: () =>
        openModal('editStrategy', { strategy, type: 'changeRates' }),
    },
  ];
  if (strategy.status !== StrategyStatus.NoBudget) {
    items.push({
      id: ItemId.WithdrawFunds,
      name: 'Withdraw Funds',
      action: () =>
        openModal('editStrategyBudget', { strategy, type: 'withdraw' }),
    });
  }
  if (strategy.status === StrategyStatus.Active) {
    items.push({
      id: ItemId.PauseStrategy,
      name: 'Pause Strategy',
      action: () => openModal('confirmStrategy', { strategy, type: 'pause' }),
    });
  }
  if (
    strategy.status === StrategyStatus.Paused ||
    strategy.status === StrategyStatus.Inactive
  ) {
    items.push({
      id: ItemId.RenewStrategy,
      name: 'Renew Strategy',
      action: () => openModal('editStrategy', { strategy, type: 'renew' }),
    });
  }

  return (
    <DropdownMenu
      isOpen={manage}
      setIsOpen={setManage}
      button={(onClick) => (
        <Button
          className="flex items-center justify-center gap-8"
          fullWidth
          variant={'black'}
          onClick={onClick}
        >
          Manage
          <IconChevron className="w-12" />
        </Button>
      )}
      className="w-full !p-10"
    >
      {items.map(({ name, action, id }) => (
        <ManageItem
          key={id}
          title={name}
          setManage={setManage}
          action={action}
          id={id}
        />
      ))}
    </DropdownMenu>
  );
};

const ManageItem: FC<{
  title: string;
  id: ItemId;
  setManage: (flag: boolean) => void;
  action?: () => void;
}> = ({ title, id, setManage, action }) => {
  const tooltipText = getTooltipTextByItemId(id);

  if (tooltipText) {
    return (
      <Tooltip element={tooltipText} interactive={false}>
        <div
          onClick={() => {
            action && action();
            setManage(false);
          }}
          className="hover:bg-body cursor-pointer rounded-6 p-12"
        >
          {title}
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      onClick={() => {
        action && action();
        setManage(false);
      }}
      className="hover:bg-body cursor-pointer rounded-6 p-12"
    >
      {title}
    </div>
  );
};
