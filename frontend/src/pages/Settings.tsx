import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControl,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material';
// import { Google as GoogleIcon } from '@mui/icons-material'; // Not used in this version
import { RootState } from '../store';
import { showSnackbar } from '../store/slices/uiSlice';
import {
  initGoogleIdentityServices,
  signInAndAuthorize, // Replaces signInToGoogle
  signOut,            // Replaces signOutFromGoogle
  isSignedIn,         // Replaces isUserSignedIn
  getSignedInUserEmail, // Replaces getCurrentGoogleUser
  // addCalendarEvent, // Not used in this component directly
} from '../services/googleCalendarService';

interface UserSettings {
  notificationEnabled: boolean;
  notificationLeadTime: number;
  calendarSyncEnabled: boolean;
  calendarId: string | null;
}

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const firebaseUser = useSelector((state: RootState) => state.auth.user); // Firebase user from Redux

  const [settings, setSettings] = useState<UserSettings>({
    notificationEnabled: true,
    notificationLeadTime: 15,
    calendarSyncEnabled: false, // This will be updated based on Google Sign-In state
    calendarId: null,
  });

  // State for Google Calendar Sync
  const [isGisClientInitialized, setIsGisClientInitialized] = useState<boolean>(false);
  const [isGoogleCalendarAuthorized, setIsGoogleCalendarAuthorized] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);

  // Ref to track if the initial status check has been performed to avoid premature snackbars
  const initialAuthCheckPerformed = useRef(false);
  // Ref to track the previous calendarSyncEnabled state to show disconnect snackbar correctly
  const prevCalendarSyncEnabledRef = useRef(false);

  // Callback to handle Google authorization status changes from the service
  const handleGoogleAuthStatusChange = useCallback((isAuthorized: boolean, email: string | null) => {
    console.log('Settings.tsx: Google Auth Status Changed - Authorized:', isAuthorized, 'Email:', email);
    setIsGoogleCalendarAuthorized(isAuthorized);
    setGoogleUserEmail(email);
    setSettings(prev => ({
      ...prev,
      calendarSyncEnabled: isAuthorized,
      calendarId: isAuthorized ? 'primary' : null, // Assuming 'primary' calendar for simplicity
    }));

    // Show snackbar only after initial check and if state actually changed meaningfully
    if (initialAuthCheckPerformed.current) {
      if (isAuthorized && email) {
        dispatch(showSnackbar({ message: `已連接到 Google 日曆 (${email})`, severity: 'success' }));
      } else if (!isAuthorized && prevCalendarSyncEnabledRef.current) {
        // Only show disconnect message if it was previously enabled
        dispatch(showSnackbar({ message: '已斷開與 Google 日曆的連接', severity: 'info' }));
      }
    }
    prevCalendarSyncEnabledRef.current = isAuthorized; // Update ref after processing
  }, [dispatch]);


  useEffect(() => {
    // Initialize Google Identity Services and set up the status change listener
    initGoogleIdentityServices(handleGoogleAuthStatusChange)
      .then(() => {
        console.log('Settings.tsx: Google Identity Services client initialization successful.');
        setIsGisClientInitialized(true);
        // After successful initialization, check the current authorization state
        const currentAuthStatus = isSignedIn();
        const currentEmail = getSignedInUserEmail();
        console.log('Settings.tsx: Initial Google Auth Status - Authorized:', currentAuthStatus, 'Email:', currentEmail);
        // Update component state based on the initial check
        handleGoogleAuthStatusChange(currentAuthStatus, currentEmail);
        initialAuthCheckPerformed.current = true; // Mark initial check as performed
      })
      .catch((error: any) => {
        console.error('Settings.tsx: Failed to initialize Google Identity Services:', error);
        setIsGisClientInitialized(false); // Ensure this is false if init fails
        dispatch(showSnackbar({ message: 'Google服務初始化失敗，日曆同步可能無法使用。', severity: 'error' }));
        initialAuthCheckPerformed.current = true; // Still mark as performed to prevent snackbar loops
      });
  }, [dispatch, handleGoogleAuthStatusChange]); // handleGoogleAuthStatusChange is stable due to useCallback

  const handleNotificationToggle = () => {
    setSettings(prev => ({
      ...prev,
      notificationEnabled: !prev.notificationEnabled,
    }));
  };

  const handleCalendarSyncToggle = async () => {
    if (!isGisClientInitialized) {
      dispatch(showSnackbar({ message: 'Google服務尚未初始化，請稍候。', severity: 'warning' }));
      return;
    }

    if (isGoogleCalendarAuthorized) { // If currently authorized, user wants to sign out
      console.log('Settings.tsx: Attempting to sign out from Google Calendar...');
      signOut(); // This will trigger the status callback
    } else { // If not authorized, user wants to sign in and authorize
      console.log('Settings.tsx: Attempting to sign in and authorize Google Calendar...');
      signInAndAuthorize(); // This will trigger the status callback
    }
  };

  const handleLeadTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setSettings(prev => ({
        ...prev,
        notificationLeadTime: value,
      }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement actual settings persistence (e.g., to Firebase Firestore)
      console.log('Saving settings:', { ...settings, isGoogleCalendarAuthorized, googleUserEmail });
      dispatch(showSnackbar({
        message: '設置已更新 (模擬)',
        severity: 'success',
      }));
    } catch (error) {
      console.error('Error saving settings:', error);
      dispatch(showSnackbar({
        message: '更新設置失敗',
        severity: 'error',
      }));
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        設置
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          通知設置
        </Typography>
        <Stack spacing={3}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notificationEnabled}
                onChange={handleNotificationToggle}
              />
            }
            label="啟用通知"
          />
          {settings.notificationEnabled && (
            <FormControl fullWidth>
              <TextField
                label="提前通知時間（分鐘）"
                type="number"
                value={settings.notificationLeadTime}
                onChange={handleLeadTimeChange}
                inputProps={{ min: 1 }}
              />
            </FormControl>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Google日曆同步
        </Typography>
        <Stack spacing={3}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.calendarSyncEnabled} // This is driven by isGoogleCalendarAuthorized
                onChange={handleCalendarSyncToggle}
                disabled={!isGisClientInitialized} // Disable toggle until GIS client is ready
              />
            }
            label={
              !isGisClientInitialized
                ? "Google服務載入中..."
                : settings.calendarSyncEnabled && googleUserEmail
                  ? `已連接 (${googleUserEmail}) - 點此斷開`
                  : "啟用Google日曆同步"
            }
          />
          {settings.calendarSyncEnabled && googleUserEmail && settings.calendarId && (
            <Alert severity="success">
              已同步到 Google 日曆 (帳戶: {googleUserEmail}, 日曆ID: {settings.calendarId})
            </Alert>
          )}
          {!settings.calendarSyncEnabled && isGisClientInitialized && (
            <Alert severity="info">
              啟用同步後，您將被要求授權存取您的Google日曆。
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          帳戶資訊
        </Typography>
        <Stack spacing={2}>
          <Typography>
            Firebase 電子郵件：{firebaseUser?.email || '未登入'}
          </Typography>
          <Typography>
            Firebase 名稱：{firebaseUser?.displayName || 'N/A'}
          </Typography>
          {isGoogleCalendarAuthorized && googleUserEmail && (
            <Typography>
              Google 帳戶：{googleUserEmail}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="contained"
          onClick={handleSaveSettings}
        >
          保存設置
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
