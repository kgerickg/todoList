import React, { useEffect } from 'react';
import './App.css'; // 引入 App.css
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, ThemeProvider, CssBaseline } from '@mui/material'; // ThemeProvider 和 CssBaseline
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { initGoogleIdentityServices } from './services/googleCalendarService'; // Updated import
import { setUser, setLoading } from './store/slices/authSlice';
import { RootState } from './store';
import { getAppTheme } from './theme'; // 引入 getAppTheme
import { ThemeMode } from './store/slices/uiSlice'; // 引入 ThemeMode

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TodoList from './pages/TodoList';
import Settings from './pages/Settings';
import CalendarPage from './pages/CalendarPage.tsx'; // Import CalendarPage

// Components
import PrivateRoute from './components/PrivateRoute';
import GlobalSnackbar from './components/GlobalSnackbar';
import TodoDialog from './components/TodoDialog'; // Import TodoDialog

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading, isInitialized } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.ui.themeMode as ThemeMode); // 取得主題模式

  // 根據 themeMode 取得目前的主題
  const currentTheme = getAppTheme(themeMode);

  useEffect(() => {
    // Firebase Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user));
      dispatch(setLoading(false));
    });

    // Initialize Google Identity Services
    initGoogleIdentityServices()
      .then(() => {
        console.log('Google Identity Services initialized successfully from App.tsx.');
      })
      .catch((error: any) => { // Added type for error
        console.error('Failed to initialize Google Identity Services from App.tsx:', error);
        // Optionally dispatch a snackbar warning if needed
        // dispatch(showSnackbar({ message: '無法載入Google服務，日曆同步可能無法使用。', severity: 'warning' }));
      });

    return () => {
      unsubscribeAuth();
    };
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}> {/* 使用 ThemeProvider 包裹 */}
      <CssBaseline /> {/* CssBaseline 用於標準化 CSS */}
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } />

        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="todos" element={<TodoList />} />
          <Route path="settings" element={<Settings />} />
          <Route path="calendar" element={<CalendarPage />} /> {/* Add CalendarPage route */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalSnackbar />
      <TodoDialog /> {/* Add TodoDialog here */}
    </ThemeProvider>
  );
};

export default App;
