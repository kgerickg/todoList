import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User as FirebaseUser } from 'firebase/auth';

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.user = action.payload;
      state.isInitialized = true; // Mark as initialized once user state is set
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    signOut: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setLoading, signOut } = authSlice.actions;
export default authSlice.reducer;
