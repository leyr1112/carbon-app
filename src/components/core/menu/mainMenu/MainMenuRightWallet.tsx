import { FC, useMemo } from 'react';
import { useModal } from 'hooks/useModal';
import { useWeb3 } from 'libs/web3';
import { shortenString } from 'utils/helpers';
import { Button } from 'components/common/button';
import { DropdownMenu } from 'components/common/dropdownMenu';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
import { ReactComponent as IconETHLogo } from 'assets/logos/ethlogo.svg';
import { ReactComponent as IconMetaMaskLogo } from 'assets/logos/metamask.svg';
import { ReactComponent as IconCoinbaseLogo } from 'assets/logos/coinbase.svg';
import { ReactComponent as IconGnosisLogo } from 'assets/logos/gnosis.svg';
import { ReactComponent as IconImposterLogo } from 'assets/logos/imposter.svg';
import {
  IS_COINBASE_WALLET,
  IS_IN_IFRAME,
  IS_METAMASK_WALLET,
} from 'libs/web3/web3.utils';
import { carbonEvents } from 'services/googleTagManager';

const WalletIcon = ({ isImposter }: { isImposter: boolean }) => {
  const props = { className: 'w-20' };

  if (isImposter) {
    return <IconImposterLogo {...props} />;
  }
  if (IS_IN_IFRAME) {
    return <IconGnosisLogo {...props} />;
  }
  if (IS_METAMASK_WALLET) {
    return <IconMetaMaskLogo {...props} />;
  }
  if (IS_COINBASE_WALLET) {
    return <IconCoinbaseLogo {...props} />;
  }

  return <IconWallet {...props} />;
};

export const MainMenuRightWallet: FC = () => {
  const {
    user,
    disconnect,
    isSupportedNetwork,
    isImposter,
    isUserBlocked,
    switchNetwork,
  } = useWeb3();
  const { openModal } = useModal();

  const onClickOpenModal = () => {
    carbonEvents.navigation.navWalletConnectClick(undefined);
    openModal('wallet', undefined);
  };

  const onDisconnect = async () => {
    disconnect();
    carbonEvents.wallet.walletDisconnect({
      address: user,
    });
  };

  const buttonVariant = useMemo(() => {
    if (isUserBlocked) return 'error';
    if (!isSupportedNetwork) return 'error';
    return 'secondary';
  }, [isSupportedNetwork, isUserBlocked]);

  const buttonText = useMemo(() => {
    if (isUserBlocked) return 'Wallet Blocked';
    if (!isSupportedNetwork) return 'Wrong Network';
    if (!user) return 'Connect Wallet';
    return shortenString(user);
  }, [isSupportedNetwork, isUserBlocked, user]);

  const buttonIcon = useMemo(() => {
    const props = { className: 'w-20' };

    if (isUserBlocked) return <IconWarning {...props} />;
    if (!isSupportedNetwork) return <IconWarning {...props} />;
    if (!user) return <IconWallet {...props} />;
    return <WalletIcon {...props} isImposter={isImposter} />;
  }, [isSupportedNetwork, isUserBlocked, user, isImposter]);

  if (user) {
    return (
      <DropdownMenu
        placement="bottom-end"
        button={(onClick) => (
          <Button
            variant={buttonVariant}
            onClick={() => {
              carbonEvents.navigation.navWalletClick(undefined);
              onClick();
            }}
            className={'flex items-center space-x-10 pl-20'}
          >
            {buttonIcon}
            <span>{buttonText}</span>
          </Button>
        )}
      >
        <div className={'w-[180px] space-y-20 font-weight-400'}>
          {isSupportedNetwork ? (
            <div className={'flex items-center space-x-10'}>
              <IconETHLogo className={'w-16'} />
              <span>Ethereum Network</span>
            </div>
          ) : (
            <button
              onClick={switchNetwork}
              className={'text-red/80 hover:text-red'}
            >
              Switch Network
            </button>
          )}

          <button onClick={disconnect} className={'hover:text-white'}>
            Disconnect
          </button>
        </div>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant={buttonVariant}
      onClick={onClickOpenModal}
      className={'flex items-center space-x-10'}
    >
      {buttonIcon}
      <span>{buttonText}</span>
    </Button>
  );
};
