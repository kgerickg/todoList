import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { RootState } from '../index';

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  priority: number; // 1-5 (5 is highest)
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  userId: string;
}

export interface TodoState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

const initialState: TodoState = {
  items: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchTodos = createAsyncThunk<Todo[], void, { state: RootState }>(
  'todos/fetchTodos',
  async (_, { getState }) => {
    const user = getState().auth.user;
    if (!user) throw new Error('User not authenticated');
    const q = query(collection(db, 'todos'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
  }
);

export const addTodo = createAsyncThunk<Todo, Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, { state: RootState }>(
  'todos/addTodo',
  async (newTodo, { getState }) => {
    const user = getState().auth.user;
    if (!user) throw new Error('User not authenticated');
    const todoData = {
      ...newTodo,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'todos'), todoData);
    return { id: docRef.id, ...todoData };
  }
);

export const updateTodo = createAsyncThunk<Todo, Partial<Todo> & { id: string }>(
  'todos/updateTodo',
  async (updatedTodo) => {
    const todoRef = doc(db, 'todos', updatedTodo.id);
    const updateData = { ...updatedTodo, updatedAt: new Date().toISOString() };
    await updateDoc(todoRef, updateData);
    return updateData as Todo; // Assuming updateData has all fields of Todo
  }
);

export const deleteTodo = createAsyncThunk<string, string>(
  'todos/deleteTodo',
  async (todoId) => {
    await deleteDoc(doc(db, 'todos', todoId));
    return todoId;
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Standard reducers can be added here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch todos';
      })
      .addCase(addTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload);
      })
      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        const index = state.items.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(todo => todo.id !== action.payload);
      });
  },
});

export default todoSlice.reducer;
