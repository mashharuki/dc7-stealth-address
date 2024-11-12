import React, { useContext, useState } from 'react';
import { Box, Button, Container, Fab, Input, Typography } from '@mui/material';
import { generatePrivateKey } from 'viem/accounts';
import { MainContext } from '../../context/MainContext';
import AccountList from '../organisms/AccountList/AccountList';
import WalletConnectDialog from '../organisms/WalletConnectDialog/WalletConnectDialog';
import AddAccountDialog from '../organisms/AddAccountDialog/AddAccountDialog';

/**
 * Dashboard Component
 *
 * The Dashboard serves as the main interface for users to manage their stealth accounts.
 *
 * @component
 * @returns {JSX.Element} The rendered Dashboard component.
 */
const Dashboard: React.FC<IDashboard> = () => {
  const {
    masterPrivateKey,
    setMasterPrivateKey,
    createStealthAddress,
    accountList
  } = useContext(MainContext);

  // State to manage the visibility of the WalletConnect dialog
  const [isWcDialogOpen, setIsWcDialogOpen] = useState(false);

  // State to manage the visibility of the Add Account dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  /**
   * Generates a new stealth account with an optional nickname.
   *
   * @param {string} nickname - The nickname for the new account.
   */
  const generateAccount = (nickname: string) => {
    const nonce = BigInt(accountList.length); // Unique nonce based on current accountList count
    createStealthAddress!(nonce, nickname);   // Create a new stealth address
  };

  /**
   * Stores the master private key in the global context after validating its format.
   *
   * @param {string} privateKey - The master private key entered by the user.
   */
  const storeMasterPrivateKey = (privateKey: string): void => {
    // Ensure the private key starts with '0x' to denote hexadecimal format
    if (!privateKey.startsWith('0x')) {
      return;
    }
    setMasterPrivateKey!(privateKey as `0x${string}`); // Update the master private key in context
  };

  /**
   * Generates a new master private key and stores it.
   * This function is triggered when the user clicks the "Generate Master Key" button.
   */
  const generateMasterKey = () => {
    const privateKey = generatePrivateKey(); // Generate a new private key
    storeMasterPrivateKey(privateKey);      // Store the generated private key
  };

  /**
   * Handles the click event of the Floating Action Button (FAB) to open the WalletConnect dialog.
   */
  const handleFabClick = () => {
    setIsWcDialogOpen(true);
  };

  /**
   * Closes the WalletConnect dialog.
   */
  const handleWcDialogClose = () => {
    setIsWcDialogOpen(false);
  };

  /**
   * Opens the Add Account dialog when the user wants to create a new account.
   */
  const handleAddAccountClick = () => {
    setIsAddDialogOpen(true);
  };

  /**
   * Closes the Add Account dialog.
   */
  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
  };

  /**
   * Handles the addition of a new account by generating it and closing the dialog.
   *
   * @param {string | undefined} nickname - The nickname provided by the user for the new account.
   */
  const handleAddAccount = (nickname?: string) => {
    const nextNumber = accountList.length + 1;                     // Determine the next account number
    const finalNickname = nickname ? nickname : `Account #${nextNumber}`; // Use provided nickname or default
    void generateAccount(finalNickname);                            // Generate the new account
    setIsAddDialogOpen(false);                                     // Close Add Account dialog
  };

  return (
    <Container maxWidth="md">
      {/* Main container for the dashboard content */}
      <Box
        display={"flex"}
        alignItems={"center"}
        width={"100%"}
        flexDirection={"column"}
        mt={4}
      >
        {/* Logo Image */}
        <img
          src={'/imgs/dc7SeaLogo.avif'}
          alt={'Dc7Sea Logo'}
          width={180}
        />

        {/* Page Title */}
        <Typography variant={'h4'}>
          Stealth Address Generator
        </Typography>

        {/* Master Private Key Section */}
        <Box mt={5}>
          {/* Input field for displaying and entering the master private key */}
          <Input
            value={masterPrivateKey ? masterPrivateKey : ''}
            onChange={t => storeMasterPrivateKey(t.target.value)}
            placeholder="Enter your master private key"
          />

          {/* Button to generate a new master private key */}
          <Button
            onClick={generateMasterKey}
            variant={'contained'}
            sx={{ml: 2}}
            disabled={!!masterPrivateKey} // Disable if a master key already exists
          >
            Generate Master Key
          </Button>
        </Box>

        {/* Account Management Section */}
        <Box
          mt={4}
          display={"flex"}
          flexDirection={"column"}
          width={"100%"}
        >
          {/* Conditional rendering based on the existence of accounts */}
          {
            accountList.length === 0 && !!masterPrivateKey &&
            <>
              {/* Button to generate the first account */}
              <Button
                onClick={handleAddAccountClick}
                sx={{ mt: 1 }}
                variant={"contained"}
                disabled={!masterPrivateKey} // Disable if master key is not set
              >
                Generate your first account
              </Button>
            </>
          }
          {
            accountList.length > 0 &&
            <>
              {/* Display the list of existing accounts */}
              <AccountList />

              {/* Button to add a new account */}
              <Button
                onClick={handleAddAccountClick}
                sx={{ alignSelf: "end", mt: 1 }}
                variant={"contained"}
              >
                + Add Account
              </Button>
            </>
          }

        </Box>
      </Box>

      {/* Floating Action Button (FAB) for WalletConnect */}
      <Fab
        color="primary"
        style={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleFabClick}
        disabled={!masterPrivateKey || accountList.length === 0} // Disable if no master key or accounts
      >
        <img src={'/imgs/wcLogo.svg'} width={32} alt="WalletConnect Logo" />
      </Fab>

      {/* WalletConnect Dialog Component */}
      <WalletConnectDialog
        open={isWcDialogOpen}
        onClose={handleWcDialogClose}
      />

      {/* Add Account Dialog Component */}
      <AddAccountDialog
        open={isAddDialogOpen}
        onClose={handleAddDialogClose}
        onAdd={handleAddAccount}
        nextAccountNumber={accountList.length + 1} // Pass the next account number for default nickname
      />
    </Container>
  );
};

export interface IDashboard {

}

export default Dashboard;
