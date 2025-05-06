import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertColor } from '@mui/material/Alert';
import { Todo } from './todoSlice'; // Import Todo type

export type DialogType = 'create' | 'edit' | 'delete' | null;

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface DialogState {
  type: DialogType;
  open: boolean;
  data?: Todo | { id: string }; // Allow Todo or just id for delete
}

export type ThemeMode = 'light' | 'dark';

export interface UIState {
  snackbar: SnackbarState;
  dialog: DialogState;
  themeMode: ThemeMode; // 新增 themeMode 狀態
}

const initialState: UIState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  dialog: {
    type: null,
    open: false,
    data: undefined,
  },
  themeMode: 'light', // 預設為淺色模式
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 切換主題模式的 reducer
    toggleThemeMode: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; severity: AlertColor }>
    ) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.severity = action.payload.severity;
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    showDialog: (
      state,
      action: PayloadAction<{ type: DialogType; data?: Todo | { id: string } }>
    ) => {
      state.dialog.type = action.payload.type;
      state.dialog.open = true;
      state.dialog.data = action.payload.data;
    },
    hideDialog: (state) => {
      state.dialog.open = false;
      state.dialog.type = null;
      state.dialog.data = undefined;
    },
  },
});

export const {
  showSnackbar,
  hideSnackbar,
  showDialog,
  hideDialog,
  toggleThemeMode, // 匯出新的 action
} = uiSlice.actions;
export default uiSlice.reducer;
