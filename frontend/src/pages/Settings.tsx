import React from 'react';
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
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { showSnackbar } from '../store/slices/uiSlice';

interface UserSettings {
  notificationEnabled: boolean;
  notificationLeadTime: number;
  calendarSyncEnabled: boolean;
  calendarId: string | null;
}

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [settings, setSettings] = React.useState<UserSettings>({
    notificationEnabled: true,
    notificationLeadTime: 15,
    calendarSyncEnabled: false,
    calendarId: null,
  });

  const handleNotificationToggle = () => {
    setSettings(prev => ({
      ...prev,
      notificationEnabled: !prev.notificationEnabled,
    }));
  };

  const handleCalendarSyncToggle = () => {
    setSettings(prev => ({
      ...prev,
      calendarSyncEnabled: !prev.calendarSyncEnabled,
    }));
  };

  const handleLeadTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setSettings(prev => ({
        ...prev,
        notificationLeadTime: value,
      }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: 實現保存設置的邏輯
      dispatch(showSnackbar({
        message: '設置已更新',
        severity: 'success',
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: '更新設置失敗',
        severity: 'error',
      }));
    }
  };

  const handleConnectCalendar = async () => {
    try {
      // TODO: 實現Google日曆連接邏輯
      dispatch(showSnackbar({
        message: '成功連接Google日曆',
        severity: 'success',
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: '連接Google日曆失敗',
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
            <FormControl>
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
                checked={settings.calendarSyncEnabled}
                onChange={handleCalendarSyncToggle}
              />
            }
            label="啟用Google日曆同步"
          />
          {settings.calendarSyncEnabled && (
            <>
              {settings.calendarId ? (
                <Alert severity="success">
                  已連接到Google日曆
                </Alert>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={handleConnectCalendar}
                >
                  連接Google日曆
                </Button>
              )}
            </>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          帳戶資訊
        </Typography>
        <Stack spacing={2}>
          <Typography>
            電子郵件：{user?.email}
          </Typography>
          <Typography>
            名稱：{user?.displayName}
          </Typography>
        </Stack>
      </Paper>

      <Box display="flex" justifyContent="flex-end">
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
