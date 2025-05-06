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

export interface UIState {
  snackbar: SnackbarState;
  dialog: DialogState;
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
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
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

export const { showSnackbar, hideSnackbar, showDialog, hideDialog } =
  uiSlice.actions;
export default uiSlice.reducer;
