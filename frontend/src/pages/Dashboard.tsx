import React, { useEffect } from 'react';
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
} from '@mui/icons-material';
import { RootState } from '../store';
import { showDialog } from '../store/slices/uiSlice';
import { Todo } from '../store/slices/todoSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const todos = useSelector((state: RootState) => state.todos.items);
  const user = useSelector((state: RootState) => state.auth.user);

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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          歡迎回來，{user?.displayName?.split(' ')[0]}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTodo}
        >
          新增待辦事項
        </Button>
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
    </Box>
  );
};

export default Dashboard;
