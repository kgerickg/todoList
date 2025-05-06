import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { setUser } from '../store/slices/authSlice';
import { showSnackbar } from '../store/slices/uiSlice';

interface LocationState {
  from?: Location;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const locationState = location.state as LocationState;

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      dispatch(setUser(result.user));
      dispatch(showSnackbar({
        message: '登入成功',
        severity: 'success'
      }));

      // 導航到用戶嘗試訪問的頁面或默認到儀表板
      const destination = locationState?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      dispatch(showSnackbar({
        message: '登入失敗，請稍後再試',
        severity: 'error'
      }));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            CloudSync Todo
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            使用Google帳號登入以管理您的待辦事項
          </Typography>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            size="large"
            sx={{ mt: 3 }}
          >
            使用Google登入
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
