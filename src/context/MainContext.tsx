import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { privateKeyToAccount } from 'viem/accounts';
import { AccountBaseType, MetaStealthKey } from './MainContextTypes';
import WalletKit from '@reown/walletkit';
import { generateKeysFromSignature } from '@fluidkey/stealth-account-kit';
import { generateStealthAddress } from '../helper/stealthAddress';

interface MainContextProps {
  chainId: number;
  activeAccount: AccountBaseType | undefined;
  activeAccountPosition: number;
  setActiveAccount?: (index: number) => void;
  setWalletKitInstance?: (walletKit: WalletKit) => void;
  accountList: AccountBaseType[];
  createStealthAddress?: (nonce: bigint, nickname: string) => void;
  walletKitInstance?: WalletKit;
  masterPrivateKey: `0x${string}` | undefined;
  setMasterPrivateKey?: (privateKey: `0x${string}`) => void;
  metaStealthKeys?: MetaStealthKey;
}

export const MainContext = createContext<MainContextProps>({
  chainId: 8453,
  activeAccount: undefined,
  activeAccountPosition: -1,
  accountList: [],
  masterPrivateKey: undefined,
});

interface MainProviderProps {
  children?: React.ReactNode;
}

export const MainProvider: React.FC<MainProviderProps> = ({ children }) => {
  const [masterPrivateKey, setMasterPrivateKey] = useState<`0x${string}` | undefined>(undefined);
  const [masterPrivateKeyLs, setMasterPrivateKeyLs] = useLocalStorage<`0x${string}` | undefined>('masterPrivateKey', undefined);
  const [accountListLs, setAccountList] = useLocalStorage<AccountBaseType[]>('accountList', []);
  const [activeAccountPositionLs, setActiveAccountPositionLs] = useLocalStorage<string>('activeAccountPosition', '');
  const [metaStealthKeys, setMetaStealthKeys] = useState<MetaStealthKey | undefined>(undefined)
  const [walletKitInstance, setWalletKitInstance] = useState<WalletKit | undefined>(undefined);

  const createStealthAddress = (nonce: bigint, nickname: string): void => {

    if (!metaStealthKeys?.viewingPrivateKey) {
      return;
    }

    const newStealthAddress = generateStealthAddress({
      nonce,
      spendingPublicKey: metaStealthKeys.spendingPublicKey,
      viewingPrivateKey: metaStealthKeys.viewingPrivateKey,
    });

    setAccountList([...(accountListLs ? accountListLs : []), {
      address: newStealthAddress.stealthAddress.toLowerCase() as `0x${string}`,
      ephemeralPublicKey: privateKeyToAccount(newStealthAddress.ephemeralPrivateKey).publicKey,
      nonce: '0x' + nonce.toString(16) as `0x${string}`,
      nickname,
    }]);
  }

  const setActiveAccount = (index: number): void => {
    setActiveAccountPositionLs(index.toString());
  }

  const setWalletKitInstanceInState = (walletKit: WalletKit): void => {
    console.log('setting wallet kit instance', walletKit);
    setWalletKitInstance(walletKit);
  }

  // initialize and create the viewing / spending keys
  const initMasterKey = useCallback(async (masterPrivateKey: `0x${string}`) => {
    setMasterPrivateKey(masterPrivateKey);

    // generate the signature
    const message_to_authenticate = 'Hello Devcon 7!!';
    const masterKeyAccount = privateKeyToAccount(masterPrivateKey);
    const messageSignature = await masterKeyAccount.signMessage({
      message: message_to_authenticate,
    });

    // generate the keys
    const keys = generateKeysFromSignature(messageSignature);
    console.log('keys', keys);
    setMetaStealthKeys({
      spendingPublicKey: privateKeyToAccount(keys.spendingPrivateKey).publicKey,
      spendingPrivateKey: keys.spendingPrivateKey,
      viewingPublicKey: privateKeyToAccount(keys.viewingPrivateKey).publicKey,
      viewingPrivateKey: keys.viewingPrivateKey,
    });
  }, []);

  const storeMasterPrivateKey = (privateKey: `0x${string}`): void => {
    void initMasterKey(privateKey);
    setMasterPrivateKeyLs(privateKey);
  }

  // load masterPrivateKey from LS
  useEffect(() => {
    if (masterPrivateKeyLs) {
      void initMasterKey(masterPrivateKeyLs);
    }
  }, [masterPrivateKeyLs]);

  useEffect(() => {
    if (accountListLs && accountListLs.length > 0 && activeAccountPositionLs === '') {
      setActiveAccount(0);
    }
  }, [accountListLs, activeAccountPositionLs]);

  return (
    <MainContext.Provider
      value={{
        chainId: 8453,
        masterPrivateKey,
        createStealthAddress,
        activeAccount: activeAccountPositionLs && accountListLs ? accountListLs[parseInt(activeAccountPositionLs)] : undefined,
        activeAccountPosition: activeAccountPositionLs ? parseInt(activeAccountPositionLs) : -1,
        setWalletKitInstance: setWalletKitInstanceInState,
        accountList: accountListLs ? accountListLs : [],
        setActiveAccount,
        walletKitInstance,
        setMasterPrivateKey: storeMasterPrivateKey,
        metaStealthKeys,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
