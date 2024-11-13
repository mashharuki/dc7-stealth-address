import React, { useContext } from 'react';
import {
  Box,
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
import { CheckCircle, FiberManualRecord, Launch, } from '@mui/icons-material';

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
                <Box display={"flex"} flexDirection={"row"}>
                  <Typography sx={{mt: 1}}>{acc.address}</Typography>
                  <Tooltip title="View on BaseScan">
                    <IconButton
                      component="a"
                      href={`https://basescan.org/address/${acc.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${acc.address} on BaseScan`}
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      <Launch fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
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
