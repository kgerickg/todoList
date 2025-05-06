import React, { useEffect, useState } from 'react'; // Added useState
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  AddAlarm as AddAlarmIcon, // Added for new button
} from '@mui/icons-material';
import { RootState } from '../store';
import { showDialog, showSnackbar } from '../store/slices/uiSlice'; // Added showSnackbar
import { Todo } from '../store/slices/todoSlice';
import AddReminderDialog from '../components/AddReminderDialog.tsx'; // Import the new dialog, added .tsx
import {
  addCalendarEvent,
  isSignedIn as isGoogleSignedIn,
  signInAndAuthorize,
} from '../services/googleCalendarService'; // Import Google Calendar service

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const todos = useSelector((state: RootState) => state.todos.items);
  const user = useSelector((state: RootState) => state.auth.user);

  const [isAddReminderDialogOpen, setIsAddReminderDialogOpen] = useState(false); // State for dialog
  // Removed calendar-related states

  const stats = {
    total: todos.length,
    completed: todos.filter((todo: Todo) => todo.completed).length,
    pending: todos.filter((todo: Todo) => !todo.completed).length,
    highPriority: todos.filter((todo: Todo) => todo.priority >= 4).length,
  };

  const completionRate = stats.total ? (stats.completed / stats.total) * 100 : 0;

  const handleAddTodo = () => {
    dispatch(showDialog({
      type: 'create'
    }));
  };

  const handleOpenAddReminderDialog = () => {
    // Check if user is signed into Google before opening dialog
    // This is a good place as the dialog is specifically for Google Calendar
    if (!isGoogleSignedIn()) {
      const confirmSignIn = window.confirm('您需要登入 Google 才能新增日曆提醒。是否現在登入？');
      if (confirmSignIn) {
        signInAndAuthorize();
        // Optionally, you could add a listener or a delay then check again,
        // or inform the user to click the button again after signing in.
        // For simplicity, we'll let them click again.
        dispatch(showSnackbar({ message: '請在 Google 登入完成後，再次點擊「新增提醒到日曆」。', severity: 'info' }));
      } else {
        dispatch(showSnackbar({ message: '未登入 Google，無法新增提醒。', severity: 'warning' }));
      }
      return; // Don't open dialog if not signed in / sign-in not initiated
    }
    setIsAddReminderDialogOpen(true);
  };

  const handleCloseAddReminderDialog = () => {
    setIsAddReminderDialogOpen(false);
  };

  const handleAddReminder = async (details: { summary: string; dateTime: string; location?: string }) => {
    // isGoogleSignedIn() check is good here too, but handleOpenAddReminderDialog should prevent this if not signed in.
    if (!isGoogleSignedIn()) {
      dispatch(showSnackbar({ message: '錯誤：嘗試新增提醒但未登入 Google。', severity: 'error' }));
      return;
    }

    try {
      const startDate = new Date(details.dateTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 事件持續 1 小時

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await addCalendarEvent({
        summary: details.summary,
        location: details.location,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: timeZone,
        },
      });
      dispatch(showSnackbar({ message: '提醒已成功新增到 Google 日曆！', severity: 'success' }));
      setIsAddReminderDialogOpen(false); // 關閉對話框
      // Removed fetchEvents() call as calendar events are now on a separate page
    } catch (error: any) {
      console.error('新增 Google 日曆提醒失敗:', error);
      dispatch(showSnackbar({ message: `新增提醒失敗: ${error.message || '未知錯誤'}`, severity: 'error' }));
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box sx={{ color }}>{icon}</Box>
          <Typography variant="h6" component="div" ml={1}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    // Main content now takes full width as calendar display is removed
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          歡迎回來，{user?.displayName?.split(' ')[0] || user?.email || '使用者'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<AddAlarmIcon />}
            onClick={handleOpenAddReminderDialog}
            sx={{ mr: 2 }}
          >
            新增提醒到日曆
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTodo}
          >
            新增待辦事項
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="總待辦事項"
            value={stats.total}
            icon={<AssignmentIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="已完成"
            value={stats.completed}
            icon={<CheckCircleIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="待處理"
            value={stats.pending}
            icon={<ScheduleIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="高優先級"
            value={stats.highPriority}
            icon={<StarIcon />}
            color="#f44336"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              完成進度
            </Typography>
            <Box display="flex" alignItems="center">
              <Box width="100%" mr={1}>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Box minWidth={35}>
                <Typography variant="body2" color="textSecondary">
                  {completionRate.toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <AddReminderDialog
        open={isAddReminderDialogOpen}
        onClose={handleCloseAddReminderDialog}
        onAddReminder={handleAddReminder}
      />
    </Box>
  );
};

export default Dashboard;
