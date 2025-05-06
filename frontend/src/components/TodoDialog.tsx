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
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { RootState } from '../store';
import { hideDialog, showSnackbar } from '../store/slices/uiSlice';
import { addTodo, updateTodo, deleteTodo, Todo } from '../store/slices/todoSlice';
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
    if (type === 'create' || type === 'edit') {
      if (!title.trim()) {
        dispatch(showSnackbar({ message: '標題不能為空', severity: 'error' }));
        return;
      }
      if (!dueDate) {
        dispatch(showSnackbar({ message: '到期日不能為空', severity: 'error' }));
        return;
      }
    }

    try {
      if (type === 'create' && dueDate) {
        const todoData = {
          title,
          description,
          dueDate: formatISO(dueDate),
          priority,
          completed: false,
        };
        // @ts-ignore
        await dispatch(addTodo(todoData)).unwrap();
        dispatch(showSnackbar({ message: '待辦事項已新增', severity: 'success' }));
      } else if (type === 'edit' && data?.id && dueDate) {
        const todoData = {
          title,
          description,
          dueDate: formatISO(dueDate),
          priority,
          completed: (data as Todo).completed, // Ensure data is treated as Todo
        };
        // @ts-ignore
        await dispatch(updateTodo({ ...todoData, id: data.id })).unwrap();
        dispatch(showSnackbar({ message: '待辦事項已更新', severity: 'success' }));
      } else if (type === 'delete' && data?.id) {
        // @ts-ignore
        await dispatch(deleteTodo(data.id)).unwrap();
        dispatch(showSnackbar({ message: '待辦事項已刪除', severity: 'success' }));
      }
      handleClose();
    } catch (error) {
      dispatch(showSnackbar({ message: '操作失敗', severity: 'error' }));
      console.error("Failed to process todo:", error);
    }
  };

  const getDialogTitle = () => {
    if (type === 'create') return '新增待辦事項';
    if (type === 'edit') return '編輯待辦事項';
    if (type === 'delete') return '確認刪除';
    return '';
  };

  const getSubmitButtonText = () => {
    if (type === 'create') return '新增';
    if (type === 'edit') return '儲存';
    if (type === 'delete') return '刪除';
    return '';
  };

  if (!open) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          {type === 'delete' && data && 'title' in data ? (
            <Typography>您確定要刪除待辦事項 "{(data as Todo).title}" 嗎？此操作無法復原。</Typography>
          ) : type === 'create' || type === 'edit' ? (
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
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" color={type === 'delete' ? 'error' : 'primary'}>
            {getSubmitButtonText()}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TodoDialog;
