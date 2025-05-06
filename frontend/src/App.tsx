import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { setUser, setLoading } from './store/slices/authSlice';
import { RootState } from './store';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TodoList from './pages/TodoList';
import Settings from './pages/Settings';

// Components
import PrivateRoute from './components/PrivateRoute';
import GlobalSnackbar from './components/GlobalSnackbar';
import TodoDialog from './components/TodoDialog'; // Import TodoDialog

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading, isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user));
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
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
    <>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="todos" element={<TodoList />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalSnackbar />
      <TodoDialog /> {/* Add TodoDialog here */}
    </>
  );
};

export default App;
