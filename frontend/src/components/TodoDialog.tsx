import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  TextFieldProps,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { RootState } from '../store';
import { hideDialog, showSnackbar } from '../store/slices/uiSlice';
import { addTodo, updateTodo, Todo } from '../store/slices/todoSlice';
import { formatISO, parseISO } from 'date-fns';

const TodoDialog: React.FC = () => {
  const dispatch = useDispatch();
  const { open, type, data } = useSelector((state: RootState) => state.ui.dialog);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [priority, setPriority] = useState<number>(3); // Default to medium priority

  useEffect(() => {
    if (open && type === 'edit' && data) {
      const todoData = data as Todo;
      setTitle(todoData.title);
      setDescription(todoData.description);
      setDueDate(parseISO(todoData.dueDate));
      setPriority(todoData.priority);
    } else {
      // Reset form for 'create' or when dialog is closed
      setTitle('');
      setDescription('');
      setDueDate(new Date());
      setPriority(3);
    }
  }, [open, type, data]);

  const handleClose = () => {
    dispatch(hideDialog());
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      dispatch(showSnackbar({ message: '標題不能為空', severity: 'error' }));
      return;
    }
    if (!dueDate) {
      dispatch(showSnackbar({ message: '到期日不能為空', severity: 'error' }));
      return;
    }

    const todoData = {
      title,
      description,
      dueDate: formatISO(dueDate),
      priority,
      completed: type === 'edit' && data ? (data as Todo).completed : false,
    };

    try {
      if (type === 'create') {
        // @ts-ignore
        await dispatch(addTodo(todoData)).unwrap();
        dispatch(showSnackbar({ message: '待辦事項已新增', severity: 'success' }));
      } else if (type === 'edit' && data?.id) {
        // @ts-ignore
        await dispatch(updateTodo({ ...todoData, id: data.id })).unwrap();
        dispatch(showSnackbar({ message: '待辦事項已更新', severity: 'success' }));
      }
      handleClose();
    } catch (error) {
      dispatch(showSnackbar({ message: '操作失敗', severity: 'error' }));
      console.error("Failed to save todo:", error);
    }
  };
  
  if (!open) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{type === 'create' ? '新增待辦事項' : '編輯待辦事項'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
            <TextField
              label="標題"
              fullWidth
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              label="描述"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <DateTimePicker
              label="到期時間"
              value={dueDate}
              onChange={(newValue: Date | null) => setDueDate(newValue)}
              renderInput={(params: TextFieldProps) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  required
                />
              )}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>優先級</InputLabel>
              <Select
                value={priority}
                label="優先級"
                onChange={(e: SelectChangeEvent<number>) => setPriority(e.target.value as number)}
              >
                <MenuItem value={5}>最高 (P5)</MenuItem>
                <MenuItem value={4}>高 (P4)</MenuItem>
                <MenuItem value={3}>中 (P3)</MenuItem>
                <MenuItem value={2}>低 (P2)</MenuItem>
                <MenuItem value={1}>最低 (P1)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">
            {type === 'create' ? '新增' : '儲存'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TodoDialog;
