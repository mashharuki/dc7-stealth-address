import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (nickname?: string) => void;
  nextAccountNumber: number;
}

/**
 * AddAccountDialog Component
 * @param param0 
 * @returns 
 */
const AddAccountDialog: React.FC<AddAccountDialogProps> = ({
                                                             open,
                                                             onClose,
                                                             onAdd,
                                                             nextAccountNumber,
                                                           }) => {
  const [nickname, setNickname] = useState('');

  const handleAdd = () => {
    onAdd(nickname.trim() === '' ? undefined : nickname.trim());
    setNickname('');
  };

  const handleClose = () => {
    onClose();
    setNickname('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Account</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter a nickname for your new account (optional). If left blank, it will be set to "Account #
          {nextAccountNumber}".
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Nickname"
          type="text"
          fullWidth
          variant="outlined"
          placeholder={`Account #${nextAccountNumber}`}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAdd} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAccountDialog;
