import { createTheme, ThemeOptions } from '@mui/material/styles';

// 定義淺色主題的選項
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 標準藍色
    },
    secondary: {
      main: '#dc004e', // 標準粉紅/紅色
    },
    background: {
      default: '#f4f6f8', // 淺灰色背景
      paper: '#ffffff', // 紙張元素的白色背景
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly more rounded buttons
          textTransform: 'none', // Keep button text case as is
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for paper elements
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // 較扁平的 AppBar
          borderBottom: '1px solid #e0e0e0', // 細微的邊框
        },
      },
    },
  },
};

// 定義深色主題的選項
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // 淺藍色，適合深色模式
    },
    secondary: {
      main: '#f48fb1', // 淺粉紅色，適合深色模式
    },
    background: {
      default: '#121212', // 深色背景
      paper: '#1e1e1e', // 紙張元素的深色背景
    },
    text: {
      primary: '#ffffff',
      secondary: '#bbbbbb',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // 稍微圓角的按鈕
          textTransform: 'none', // 保持按鈕文字大小寫
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // 紙張元素的圓角
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // 較扁平的 AppBar
          borderBottom: '1px solid #333333', // 深色模式的細微邊框
        },
      },
    },
  },
};

// 根據模式創建並匯出主題的函數
export const getAppTheme = (mode: 'light' | 'dark') =>
  createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions);
