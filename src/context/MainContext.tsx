import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { privateKeyToAccount } from 'viem/accounts';
import { AccountBaseType, MetaStealthKey } from './MainContextTypes';
import WalletKit from '@reown/walletkit';
import { generateKeysFromSignature } from '@fluidkey/stealth-account-kit';
import { generateMetaStealthKeys, generateStealthAddress } from '../helper/stealthAddress';

/**
 * Defines the shape of the MainContext, that for the scope of this project
 * are the unique data storage for the application.
 */
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

/**
 * Initializes the MainContext with default values.
 */
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

/**
 * MainProvider manages the global state related to accounts, master keys,
 * and WalletKit integration. It provides functions to create stealth addresses,
 * set active accounts, and manage WalletKit instances.
 */
export const MainProvider: React.FC<MainProviderProps> = ({ children }) => {
  // State for the master private key, initially undefined
  const [masterPrivateKey, setMasterPrivateKey] = useState<`0x${string}` | undefined>(undefined);

  // Local storage hook for persisting the master private key
  const [masterPrivateKeyLs, setMasterPrivateKeyLs] = useLocalStorage<`0x${string}` | undefined>('masterPrivateKey', undefined);

  // Local storage hook for persisting the list of accounts
  const [accountListLs, setAccountList] = useLocalStorage<AccountBaseType[]>('accountList', []);

  // Local storage hook for persisting the active account position
  const [activeAccountPositionLs, setActiveAccountPositionLs] = useLocalStorage<string>('activeAccountPosition', '');

  // State for storing meta stealth keys generated from the master private key
  const [metaStealthKeys, setMetaStealthKeys] = useState<MetaStealthKey | undefined>(undefined);

  // State for storing the WalletKit instance
  const [walletKitInstance, setWalletKitInstance] = useState<WalletKit | undefined>(undefined);

  /**
   * Creates a new stealth address using the provided nonce and nickname.
   * It utilizes the meta stealth keys to generate the stealth address and stores it in the account list.
   *
   * @param nonce - A unique number to ensure the stealth address is unique
   * @param nickname - An optional nickname for the new account
   */
  const createStealthAddress = (nonce: bigint, nickname: string): void => {
    if (!metaStealthKeys?.viewingPrivateKey) {
      return;
    }

    // Generate a new stealth address and its corresponding ephemeral private key
    const newStealthAddress = generateStealthAddress({
      nonce,
      spendingPublicKey: metaStealthKeys.spendingPublicKey,
      viewingPrivateKey: metaStealthKeys.viewingPrivateKey,
    });

    // Add the new account to the account list and persist it in local storage
    setAccountList([
      ...(accountListLs ? accountListLs : []),
      {
        address: newStealthAddress.stealthAddress.toLowerCase() as `0x${string}`,
        ephemeralPublicKey: privateKeyToAccount(newStealthAddress.ephemeralPrivateKey).publicKey,
        nonce: '0x' + nonce.toString(16) as `0x${string}`,
        nickname,
      },
    ]);
  };

  /**
   * Sets the active account based on the provided index.
   *
   * @param index - The index of the account to set as active
   */
  const setActiveAccount = (index: number): void => {
    setActiveAccountPositionLs(index.toString());
  };

  /**
   * Updates the WalletKit instance in the state and logs the action.
   *
   * @param walletKit - The WalletKit instance to be set
   */
  const setWalletKitInstanceInState = (walletKit: WalletKit): void => {
    setWalletKitInstance(walletKit);
  };

  /**
   * Initializes the master key by setting it in the state, generating a signature,
   * and deriving the meta stealth keys from the signature.
   *
   * @param masterPrivateKey - The master private key to initialize with
   */
  const initMasterKey = useCallback(async (masterPrivateKey: `0x${string}`) => {

    const keys = await generateMetaStealthKeys({
      masterPrivateKey,
    });

    if (keys.viewingPrivateKey === '0x') {
      return;
    }
    setMasterPrivateKey(masterPrivateKey);

    setMetaStealthKeys({
      spendingPublicKey: privateKeyToAccount(keys.spendingPrivateKey).publicKey,
      spendingPrivateKey: keys.spendingPrivateKey,
      viewingPublicKey: privateKeyToAccount(keys.viewingPrivateKey).publicKey,
      viewingPrivateKey: keys.viewingPrivateKey,
    });
  }, []);

  /**
   * Stores the master private key by initializing it and persisting it in local storage.
   *
   * @param privateKey - The master private key to store
   */
  const storeMasterPrivateKey = (privateKey: `0x${string}`): void => {
    void initMasterKey(privateKey);
    setMasterPrivateKeyLs(privateKey);
  };

  /**
   * Loads the master private key from local storage upon component mount
   * and initializes it if present.
   */
  useEffect(() => {
    if (masterPrivateKeyLs) {
      void initMasterKey(masterPrivateKeyLs);
    }
  }, [masterPrivateKeyLs]);

  /**
   * Sets the active account to the first account in the list if no active account is currently set.
   */
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
