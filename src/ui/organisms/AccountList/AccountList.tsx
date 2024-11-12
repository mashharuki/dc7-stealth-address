import React, { useContext } from 'react';
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { MainContext } from '../../../context/MainContext';
import { CheckCircle, FiberManualRecord, } from '@mui/icons-material';

/**
 *
 * @param {React.PropsWithChildren<IAccountList>} props
 * @return {JSX.Element}
 * @constructor
 */
const AccountList: React.FC<IAccountList> = () => {
  const { activeAccount, accountList, setActiveAccount } = useContext(MainContext);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="account list">
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Address</TableCell>
            <TableCell align="right">Set Active</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accountList.map((acc, index) => (
            <TableRow key={acc.address}>
              <TableCell component="th" scope="row">
                {activeAccount?.address === acc.address ? (
                  <Tooltip title="Active Account">
                    <FiberManualRecord color="success" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Inactive Account">
                    <FiberManualRecord color="disabled" />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                <Chip size={'small'}
                      color={'primary'}
                      label={acc.nickname} />
                <Typography sx={{mt: 1}}>{acc.address}</Typography>
              </TableCell>
              <TableCell align="right">
                {activeAccount?.address !== acc.address && (
                  <Tooltip title="Set as Active">
                    <IconButton
                      color="primary"
                      onClick={() => setActiveAccount && setActiveAccount(index)}
                    >
                      <CheckCircle />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


export interface IAccountList {

}

export default AccountList;
