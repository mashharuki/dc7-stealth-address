import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import theme from './ui/theme';
import Dashboard from './ui/pages/Dashboard';
import { MainProvider } from './context/MainContext';
import Core from '@walletconnect/core';
import WalletKitProvider from './provider/WalletKitProvider';

const core = new Core({
  projectId: process.env.REACT_APP_REOWN_PROJECT_ID
})

function App(): JSX.Element {

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <MainProvider>
          <WalletKitProvider>
            <CssBaseline/>
            <Routes>
              <Route path="/" element={<Dashboard/>}/>
            </Routes>
          </WalletKitProvider>
        </MainProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
