import React, { useContext, useState } from 'react';
import { Box, Button, Container, Fab, Input, Typography } from '@mui/material';
import { generatePrivateKey } from 'viem/accounts';
import { MainContext } from '../../context/MainContext';
import AccountList from '../organisms/AccountList/AccountList';
import WalletConnectDialog from '../organisms/WalletConnectDialog/WalletConnectDialog';
import AddAccountDialog from '../organisms/AddAccountDialog/AddAccountDialog';

/**
 *
 * @param {React.PropsWithChildren<IDashboard>} props
 * @return {JSX.Element}
 * @constructor
 */
const Dashboard: React.FC<IDashboard> = () => {
  const { masterPrivateKey, setMasterPrivateKey, createStealthAddress, accountList } = useContext(MainContext);

  const [isWcDialogOpen, setIsWcDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // State for AddAccountDialog

  const generateAccount = (nickname: string) => {
    const nonce = BigInt(accountList.length);
    createStealthAddress!(nonce, nickname);
  };

  const storeMasterPrivateKey = (privateKey: string): void => {
    if (!privateKey.startsWith('0x')) {
      return;
    }
    setMasterPrivateKey!(privateKey as `0x${string}`);
  }

  const generateMasterKey = () => {
    const privateKey = generatePrivateKey();
    storeMasterPrivateKey(privateKey);
  }

  const handleFabClick = () => {
    setIsWcDialogOpen(true);
  };

  const handleWcDialogClose = () => {
    setIsWcDialogOpen(false);
  };

  const handleAddAccountClick = () => {
    setIsAddDialogOpen(true); // Open the AddAccountDialog
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false); // Close the AddAccountDialog
  };

  const handleAddAccount = (nickname?: string) => {
    const nextNumber = accountList.length + 1;
    const finalNickname = nickname ? nickname : `Account #${nextNumber}`;
    void generateAccount(finalNickname);
    setIsAddDialogOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Box display={"flex"} alignItems={"center"} width={"100%"} flexDirection={"column"} mt={4}>
        <img src={'/imgs/dc7SeaLogo.avif'} alt={'Dc7Sea Logo'} width={180}/>
        <Typography variant={'h4'}>
          Stealth Address Generator
        </Typography>
        <Box mt={5}>
          <Input value={masterPrivateKey ? masterPrivateKey : ''}
                 onChange={t => storeMasterPrivateKey(t.target.value)}
          />
          <Button onClick={generateMasterKey} variant={'contained'} sx={{ml: 2}} disabled={!!masterPrivateKey}>
            Generate Master Key
          </Button>
        </Box>
        <Box mt={4} display={"flex"} flexDirection={"column"} width={"100%"}>
          {
            accountList.length === 0 && !!masterPrivateKey &&
            <>
              <Button
                onClick={handleAddAccountClick}
                sx={{ mt: 1 }}
                variant={"contained"}
                disabled={!masterPrivateKey}
              >
                Generate your first account
              </Button>
            </>
          }
          {
            accountList.length > 0 &&
            <>
              <AccountList />
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
      <Fab
        color="primary"
        style={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleFabClick}
        disabled={!masterPrivateKey || accountList.length === 0}
      >
        <img src={'/imgs/wcLogo.svg'} width={32} />
      </Fab>
      <WalletConnectDialog
        open={isWcDialogOpen}
        onClose={handleWcDialogClose}
      />
      <AddAccountDialog
        open={isAddDialogOpen}
        onClose={handleAddDialogClose}
        onAdd={handleAddAccount}
        nextAccountNumber={accountList.length + 1} // Pass the next account number
      />
    </Container>
  );
};

export interface IDashboard {

}

export default Dashboard;
