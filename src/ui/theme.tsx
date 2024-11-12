import { createTheme, darken, lighten, type ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#CDEAF7',
      contrastText: '#292C34',
      light: '#E0F2FA',
      dark: '#7DCAEE',
    },
    background: {
      default: '#22242b',
      paper: '#292C34',
    },
    text: {
      primary: '#FAFDFF',
      secondary: '#A7ACB9',
      disabled: '#C6C9D2',
    },
    divider: '#3f4350',
    error: {
      main: '#ff666a',
      contrastText: '#FFA3A6',
    },
    success: {
      main: '#80ffa2',
      contrastText: '#292C34',
    },
    warning: {
      main: '#FF9A72',
      contrastText: '#292C34',
    },
  },
  typography: {
    fontFamily: 'Work Sans, Arial, sans-serif',
    fontWeightBold: 800,
    fontWeightMedium: 600,
    fontWeightRegular: 500,
    fontWeightLight: 300,
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
      '@media (max-width:600px)': {
        fontSize: '2.4rem',
      },
    },
    h3: {
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h4: {
      fontWeight: 600,
      '@media (max-width:600px)': {
        fontSize: '1.7rem',
      },
    },
    button: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 400,
      '@media (max-width:600px)': {
        fontSize: '1.4rem',
      },
    },
    h6: {
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    body1: {
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body2: {
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        sx: {
          textTransform: 'none',
          fontWeight: 700,
        },
      },
      styleOverrides: {
        root: {
          '&.MuiButton-containedSuccess:hover': {
            backgroundColor: '#B3FFC7',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 'inherit !important',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#4F5464',
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;

export const moreColors = {
  lightPaperBackground: lighten(theme.palette.background.paper, 0.05),
  light2PaperBackground: lighten(theme.palette.background.paper, 0.1),
  lighterPaperBackground: lighten(theme.palette.background.paper, 0.5),
  lighterPrimary: lighten(theme.palette.primary.light, 0.5),
  lightSuccess: '#B3FFC7',
  lighterSuccess: lighten(theme.palette.success.light, 0.5),
  textTertiary: darken(theme.palette.text.primary, 0.2),
};

export const gradient =
  'linear-gradient(125deg,hsl(199deg 72% 89%) 0%,hsl(194deg 80% 88%) 0%,hsl(189deg 82% 87%) 1%,hsl(184deg 79% 85%) 5%,hsl(177deg 79% 84%) 13%,hsl(170deg 85% 85%) 32%,hsl(162deg 90% 85%) 59%,hsl(152deg 95% 86%) 77%,hsl(139deg 98% 88%) 90%,hsl(120deg 100% 90%) 100%)';
