import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainProvider } from './context/MainContext';
import WalletKitProvider from './provider/WalletKitProvider';
import Dashboard from './ui/pages/Dashboard';
import theme from './ui/theme';

/**
 * App component
 * @returns 
 */
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
