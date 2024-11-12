import React, { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Core from '@walletconnect/core';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { MainContext } from '../context/MainContext';
import WalletKit, { WalletKitTypes } from '@reown/walletkit';
import { privateKeyToAccount } from 'viem/accounts';
import WCConfirmationDialog from '../ui/atoms/WCConfirmationDialog/WCConfirmationDialog';
import { evalStealthAddressPrivateKey } from '../helper/stealthAddress';
import { MetaStealthKey } from '../context/MainContextTypes';

interface WalletKitProviderProps {
  children: ReactNode;
}

/**
 * WalletKitProvider manages WalletConnect sessions and handles session proposals and requests.
 * It integrates with the MainContext to access active accounts and stealth keys.
 */
const WalletKitProvider: React.FC<WalletKitProviderProps> = ({children}) => {
  const {activeAccount, accountList, setWalletKitInstance, metaStealthKeys} = useContext(MainContext);
  const walletKitRef = useRef<WalletKit | null>(null);
  const [sessionTopic, setSessionTopic] = useState<string>('');
  const [proposal, setProposal] = useState<WalletKitTypes.SessionProposal['params'] | null>(null);
  const [pendingSessionProposal, setPendingSessionProposal] = useState<{
    id: number;
    params: WalletKitTypes.SessionProposal['params'];
  } | null>(null);

  // State for confirmation modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [currentResponse, setCurrentResponse] = useState<any>(null);

  // Refs to keep track of accountList and activeAccount without causing re-renders
  const accountListRef = useRef(accountList);
  useEffect(() => {
    accountListRef.current = accountList;
  }, [accountList]);

  // Refs for metaStealthKeys and activeAccount to access latest values in callbacks
  const metaStealthKeysRef = useRef<MetaStealthKey | undefined>(metaStealthKeys);
  const activeAccountRef = useRef(activeAccount);
  useEffect(() => {
    metaStealthKeysRef.current = metaStealthKeys;
  }, [metaStealthKeys]);
  useEffect(() => {
    activeAccountRef.current = activeAccount;
  }, [activeAccount]);

  /**
   * Handles incoming session proposals by approving them if accounts are available.
   * If no accounts are available, the proposal is stored for later approval.
   */
  const onSessionProposal = useCallback(async ({id, params}: WalletKitTypes.SessionProposal) => {
    console.log('onSessionProposal - Received session proposal:', params);
    if (accountListRef.current.length === 0) {
      setPendingSessionProposal({id, params});
      console.warn('No accounts available. Session proposal is pending until accounts are added.');
      return;
    }

    await approveSessionProposal({id, params});
  }, [accountListRef]);

  /**
   * Approves a session proposal by building the approved namespaces and responding to WalletConnect.
   */
  const approveSessionProposal = async ({id, params}: { id: number; params: any }) => {
    if (!activeAccountRef.current) {
      console.warn('No active account to approve session proposal.');
      return;
    }
    try {
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: params,
        supportedNamespaces: {
          eip155: {
            chains: ['eip155:8453', 'eip155:11155111'],
            methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4'],
            events: ['accountsChanged', 'chainChanged'],
            accounts: [
              `eip155:8453:${activeAccountRef.current.address.toLowerCase()}`,
              `eip155:11155111:${activeAccountRef.current.address.toLowerCase()}`
            ],
          },
        },
      });

      const session = await walletKitRef.current!.approveSession({
        id,
        namespaces: approvedNamespaces,
      });

      setSessionTopic(session.topic);
      setProposal(params); // Store the proposal for future updates
      console.log('Approved session:', session);
    } catch (error) {
      console.error('Error approving session:', error);
      await walletKitRef.current!.rejectSession({
        id,
        reason: getSdkError("USER_REJECTED")
      });
    }
  };

  /**
   * Automatically approves any pending session proposals once accounts become available.
   */
  useEffect(() => {
    if (pendingSessionProposal && accountList.length > 0) {
      const {id, params} = pendingSessionProposal;
      setPendingSessionProposal(null);
      void approveSessionProposal({id, params});
    }
  }, [accountList, pendingSessionProposal]);

  /**
   * Handles incoming session requests by processing supported methods and prompting for user confirmation when necessary.
   */
  const handleSessionRequest = useCallback(async (event: any) => {
    console.log('Received session request:', event);
    const {topic, params, id} = event;
    const {request} = params;
    if (!activeAccountRef.current) {
      console.warn('No active account to handle session request.');
      return;
    }

    const currentMetaStealthKeys = metaStealthKeysRef.current;

    if (!currentMetaStealthKeys?.spendingPrivateKey || !activeAccountRef.current.ephemeralPublicKey) {
      console.warn('Missing required keys to handle session request.');
      await walletKitRef.current!.respondSessionRequest({
        topic, response: {
          id,
          error: {code: 4001, message: 'User rejected the request'},
          jsonrpc: '2.0'
        }
      });
      return;
    }
    const accountPrivateKey = evalStealthAddressPrivateKey({
      spendingPrivateKey: currentMetaStealthKeys?.spendingPrivateKey,
      ephemeralPublicKey: activeAccountRef.current.ephemeralPublicKey,
    });
    const account = privateKeyToAccount(accountPrivateKey);
    let response;

    // Check if the request method requires confirmation
    if (['personal_sign', 'eth_signTypedData_v4'].includes(request.method)) {
      // Open confirmation dialog
      setCurrentRequest({id, topic, request, account});
      setIsDialogOpen(true);

      // Wait for user response
      const userApproved = await new Promise<boolean>((resolve) => {
        setCurrentResponse(() => resolve);
      });

      if (userApproved) {
        // User approved, proceed with signing
        try {
          if (request.method === 'personal_sign') {
            const message = request.params[0];
            const signedMessage = await account.signMessage({
              message: {
                raw: message,
              },
            });
            response = {id, result: signedMessage, jsonrpc: '2.0'};
          } else if (request.method === 'eth_signTypedData_v4') {
            const dataToSign = JSON.parse(request.params[1]);
            const signedTypedData = await account.signTypedData(dataToSign);
            response = {id, result: signedTypedData, jsonrpc: '2.0'};
          }
        } catch (error) {
          console.error('Error handling session request:', error);
          response = {
            id,
            error: {code: -32000, message: 'Internal error'},
            jsonrpc: '2.0'
          };
        }
      } else {
        // User rejected the request
        response = {
          id,
          error: {code: 4001, message: 'User rejected the request'},
          jsonrpc: '2.0'
        };
      }

      if (!response) {
        return;
      }

      await walletKitRef.current!.respondSessionRequest({topic, response});
      setCurrentRequest(null);
      setCurrentResponse(null);
      setIsDialogOpen(false);
      return;
    }

    // Handle other methods without confirmation
    try {
      switch (request.method) {
        case 'eth_sendTransaction':
          console.log('eth_sendTransaction', request);
          // Implement transaction sending logic here
          response = {id, result: 'Transaction sent', jsonrpc: '2.0'};
          break;
        // Add more cases as needed
        default:
          console.warn('Unsupported method:', request.method);
          response = {
            id,
            error: {code: -32601, message: 'Method not found'},
            jsonrpc: '2.0'
          };
          break;
      }
    } catch (error) {
      console.error('Error handling session request:', error);
      response = {
        id,
        error: {code: -32000, message: 'Internal error'},
        jsonrpc: '2.0'
      };
    }

    await walletKitRef.current!.respondSessionRequest({topic, response});
  }, [walletKitRef, activeAccountRef]);

  /**
   * Initializes the WalletKit instance, sets up event listeners, and restores any existing sessions.
   */
  useEffect(() => {
    const initializeWalletKit = async () => {
      const core = new Core({
        projectId: process.env.REACT_APP_REOWN_PROJECT_ID
      });

      const walletKit = await WalletKit.init({
        core,
        metadata: {
          name: 'DevCon 7 Stealth Address App',
          description: 'Generate Safe signers with Stealth Addresses',
          url: 'https://localhost:3000',
          icons: []
        }
      });

      walletKitRef.current = walletKit;
      console.log('Initialized WalletKit:', walletKit);
      setWalletKitInstance!(walletKit);

      // Check for existing sessions
      const sessions = walletKit.getActiveSessions();
      const sessionTopics = Object.keys(sessions);
      if (sessionTopics.length > 0) {
        const session = sessions[sessionTopics[0]]; // Assuming single session
        setSessionTopic(session.topic);
        console.log('Restored existing session:', session);
      }

      // Set up event listeners for session proposals and requests
      walletKit.on('session_proposal', onSessionProposal);
      walletKit.on('session_request', handleSessionRequest);

      // Cleanup event listeners on unmount
      return () => {
        walletKit.off('session_proposal', onSessionProposal);
        walletKit.off('session_request', handleSessionRequest);
      };
    };

    void initializeWalletKit();
  }, []); // Empty dependency array to run only once on mount

  /**
   * Handles user confirmation for signature requests by resolving the associated promise.
   */
  const handleConfirm = async () => {
    if (currentResponse) {
      currentResponse(true); // Resolve the promise as approved
    }
  };

  /**
   * Handles user rejection for signature requests by resolving the associated promise.
   */
  const handleReject = async () => {
    if (currentResponse) {
      currentResponse(false); // Resolve the promise as rejected
    }
  };

  /**
   * Updates the WalletConnect session when the active account changes by emitting events and updating namespaces.
   */
  useEffect(() => {
    if (walletKitRef.current && sessionTopic && activeAccount && proposal) {
      // Emit accountsChanged event to notify connected wallets of the active account change
      console.log('Emitting accountsChanged event with address:', activeAccount.address);
      void walletKitRef.current.emitSessionEvent({
        topic: sessionTopic,
        event: {
          name: 'accountsChanged',
          data: [activeAccount.address.toLowerCase()],
        },
        chainId: 'eip155:8453',
      });

      // Update session namespaces to include only the active account
      const updatedNamespaces = buildApprovedNamespaces({
        proposal: proposal,
        supportedNamespaces: {
          eip155: {
            chains: ['eip155:8453', 'eip155:11155111'],
            methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4'],
            events: ['accountsChanged', 'chainChanged'],
            accounts: [
              `eip155:8453:${activeAccount.address.toLowerCase()}`,
              `eip155:11155111:${activeAccount.address.toLowerCase()}`
            ],
          },
        },
      });

      void walletKitRef.current.updateSession({
        topic: sessionTopic,
        namespaces: updatedNamespaces,
      });
      console.log('Updated session namespaces with active account:', updatedNamespaces);
    }
  }, [activeAccount, sessionTopic, proposal]);

  /**
   * Updates the WalletConnect session namespaces whenever the account list changes to reflect all available accounts.
   */
  useEffect(() => {
    if (walletKitRef.current && sessionTopic && accountList.length > 0 && proposal) {
      // Rebuild approved namespaces with updated accountList
      const updatedNamespaces = buildApprovedNamespaces({
        proposal: proposal,
        supportedNamespaces: {
          eip155: {
            chains: ['eip155:8453', 'eip155:11155111'],
            methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4'],
            events: ['accountsChanged', 'chainChanged'],
            accounts: accountList.flatMap(a => ([
              `eip155:8453:${a.address.toLowerCase()}`,
              `eip155:11155111:${a.address.toLowerCase()}`
            ]))
          }
        }
      });

      // Update session namespaces with the new list of accounts
      void walletKitRef.current.updateSession({
        topic: sessionTopic,
        namespaces: updatedNamespaces
      });
      console.log('Updated session namespaces:', updatedNamespaces);
    }
  }, [accountList, sessionTopic, proposal]);

  return <>
    {children}
    {/* Dialog for confirming signature requests */}
    <WCConfirmationDialog
      open={isDialogOpen}
      request={currentRequest?.request}
      onConfirm={handleConfirm}
      onReject={handleReject}
    />
  </>;
};

export default WalletKitProvider;
