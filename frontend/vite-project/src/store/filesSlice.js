import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (userId, { rejectWithValue }) => {
    try {
      return await api.getFiles(userId || null);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async ({ file, comment }, { rejectWithValue }) => {
    try {
      return await api.uploadFile(file, comment);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      await api.deleteFile(fileId);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const renameFile = createAsyncThunk(
  'files/renameFile',
  async ({ fileId, newName }, { rejectWithValue }) => {
    try {
      return await api.renameFile(fileId, newName);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const updateFileComment = createAsyncThunk(
  'files/updateFileComment',
  async ({ fileId, comment }, { rejectWithValue }) => {
    try {
      return await api.updateFileComment(fileId, comment);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const filesSlice = createSlice({
  name: 'files',
  initialState: {
    items: [],
    loading: false,
    uploading: false,
    error: null,
  },
  reducers: {
    clearFilesError: state => {
      state.error = null;
    },
    setFilesError: (state, action) => {
      state.error = action.payload;
    },
    addFile: (state, action) => {
      state.items.push(action.payload);
    },
    removeFile: (state, action) => {
      state.items = state.items.filter(f => f.id !== action.payload);
    },
    updateFile: (state, action) => {
      const index = state.items.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
  },
  extraReducers: builder => {
    builder
      // fetchFiles
      .addCase(fetchFiles.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // uploadFile
      .addCase(uploadFile.pending, state => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false;
        state.items.unshift(action.payload);
        state.error = null;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // deleteFile
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.items = state.items.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload;
      })
      // renameFile
      .addCase(renameFile.fulfilled, (state, action) => {
        const index = state.items.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(renameFile.rejected, (state, action) => {
        state.error = action.payload;
      })
      // updateFileComment
      .addCase(updateFileComment.fulfilled, (state, action) => {
        const index = state.items.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateFileComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearFilesError, setFilesError, addFile, removeFile, updateFile } = filesSlice.actions;
export default filesSlice.reducer;
