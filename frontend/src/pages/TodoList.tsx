import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { RootState } from '../store';
import { Todo, fetchTodos, updateTodo } from '../store/slices/todoSlice';
import { showDialog, showSnackbar } from '../store/slices/uiSlice';

const TodoList: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchTodos());
  }, [dispatch]);

  const todos = useSelector((state: RootState) => state.todos.items);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 過濾和搜索邏輯
  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || todo.priority.toString() === filterPriority;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'completed' ? todo.completed : !todo.completed);

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // 分頁邏輯
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 事項操作
  const handleAddTodo = () => {
    dispatch(showDialog({ type: 'create' }));
  };

  const handleEditTodo = (todo: Todo) => {
    dispatch(showDialog({ type: 'edit', data: todo }));
  };

  const handleDeleteTodo = (todo: Todo) => {
    dispatch(showDialog({ type: 'delete', data: todo }));
  };

  // 優先級顯示邏輯
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'error';
      case 4: return 'warning';
      case 3: return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          待辦事項列表
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTodo}
        >
          新增待辦事項
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2}>
          <TextField
            label="搜尋待辦事項"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>優先級</InputLabel>
            <Select
              value={filterPriority}
              label="優先級"
              onChange={(e: SelectChangeEvent) => setFilterPriority(e.target.value)}
            >
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="5">最高</MenuItem>
              <MenuItem value="4">高</MenuItem>
              <MenuItem value="3">中</MenuItem>
              <MenuItem value="2">低</MenuItem>
              <MenuItem value="1">最低</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>狀態</InputLabel>
            <Select
              value={filterStatus}
              label="狀態"
              onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="pending">待處理</MenuItem>
              <MenuItem value="completed">已完成</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>狀態</TableCell>
              <TableCell>標題</TableCell>
              <TableCell>內容</TableCell>
              <TableCell>優先級</TableCell>
              <TableCell>到期日</TableCell>
              <TableCell align="right">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTodos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((todo) => {
                const handleToggleComplete = () => {
                  // @ts-ignore
                  dispatch(updateTodo({ ...todo, completed: !todo.completed }))
                    .unwrap()
                    .then(() => {
                      dispatch(showSnackbar({ message: '狀態已更新', severity: 'success' }));
                    })
                    .catch(() => {
                      dispatch(showSnackbar({ message: '狀態更新失敗', severity: 'error' }));
                    });
                };

                return (
                  <TableRow key={todo.id}>
                    <TableCell padding="checkbox">
                      <IconButton size="small" onClick={handleToggleComplete}>
                        {todo.completed ?
                          <CheckCircleIcon color="success" /> :
                          <UncheckedIcon />
                        }
                      </IconButton>
                    </TableCell>
                    <TableCell>{todo.title}</TableCell>
                    <TableCell>{todo.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={`P${todo.priority}`}
                        color={getPriorityColor(todo.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(todo.dueDate), 'yyyy/MM/dd HH:mm')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditTodo(todo)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTodo(todo)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTodos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default TodoList;
