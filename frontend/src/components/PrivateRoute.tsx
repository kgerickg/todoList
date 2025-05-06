import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // 如果正在加載，顯示加載指示器
  if (loading) {
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

  // 如果用戶未登入，重定向到登入頁面，並記住嘗試訪問的URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果用戶已登入，顯示受保護的內容
  return <>{children}</>;
};

export default PrivateRoute;
