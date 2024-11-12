import React, { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Cancel, CheckCircle } from '@mui/icons-material';

interface WCConfirmationDialogProps {
  open: boolean;
  request: any; // Define a proper type based on your request structure
  onConfirm: () => void;
  onReject: () => void;
}

const WCConfirmationDialog: React.FC<WCConfirmationDialogProps> = ({ open, request, onConfirm, onReject }) => {

  let { message, dataToSign, isJson } = useMemo(() => {
    if (!request) return {
      message: '',
      dataToSign: '',
      isJson: false,
    };
    const { method, params } = request;
    if (method === 'personal_sign') {
      return {
        message: 'Do you want to sign the following message?',
        dataToSign: params[0],
        isJson: false,
      };
    } else if (method === 'eth_signTypedData_v4') {
      const typedData = JSON.stringify(JSON.parse(params[1]), null, 2);
      return {
        message: 'Do you want to sign the following typed data?',
        dataToSign: typedData,
        isJson: true,
      };
    } else return {
      message: '',
      dataToSign: '',
      isJson: false,
    };
  }, [request]);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent closing the dialog by clicking the backdrop or pressing the escape key
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
          onReject();
        }
      }}
      disableEscapeKeyDown
      scroll="body"
    >
      <DialogTitle>Signature Request</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
          {
            dataToSign &&
              <SyntaxHighlighter language={isJson ? 'json' : 'text'} style={materialDark}>
                {dataToSign}
              </SyntaxHighlighter>
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onReject}
          startIcon={<Cancel color={'error'} />}
          variant="contained"
        >
          Reject
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<CheckCircle sx={{color: 'green'}} />}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WCConfirmationDialog;
