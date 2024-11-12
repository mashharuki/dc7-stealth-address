import React, { useContext, useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Input } from '@mui/material';
import { MainContext } from '../../../context/MainContext';

interface WalletConnectDialogProps {
  open: boolean;
  onClose: () => void;
}

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({ open, onClose }) => {

  const { walletKitInstance } = useContext(MainContext);
  const [wcValue, setWcValue] = useState('');

  useEffect(() => {
    console.log('walletKitInstance inside Dashboard', walletKitInstance);
    if (wcValue.startsWith('wc:') && !!walletKitInstance) {
      console.log('pairing');
      void walletKitInstance.pair({
        uri: wcValue,
      });
    }
  }, [walletKitInstance, wcValue]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth={'sm'} fullWidth>
      <DialogTitle>WalletConnect</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter WalletConnect URI:
        </DialogContentText>
        <Input
          value={wcValue}
          onChange={t => setWcValue(t.target.value)}
          fullWidth
          placeholder="wc:..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletConnectDialog;
