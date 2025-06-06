import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { repairsAPI } from "../../services/api";

// Get repairs
export const getRepairs = createAsyncThunk(
  "repairs/getRepairs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await repairsAPI.getRepairs();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get repair by ID
export const getRepairById = createAsyncThunk(
  "repairs/getRepairById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await repairsAPI.getRepairById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Complete repair
export const completeRepair = createAsyncThunk(
  "repairs/completeRepair",
  async (id, { rejectWithValue }) => {
    try {
      const response = await repairsAPI.completeRepair(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fail repair
export const failRepair = createAsyncThunk(
  "repairs/failRepair",
  async (id, { rejectWithValue }) => {
    try {
      const response = await repairsAPI.failRepair(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get disposals
export const getDisposals = createAsyncThunk(
  "repairs/getDisposals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await repairsAPI.getDisposals();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Dispose equipment
export const disposeEquipment = createAsyncThunk(
  "repairs/disposeEquipment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await repairsAPI.disposeEquipment(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const repairSlice = createSlice({
  name: "repairs",
  initialState: {
    repairs: [],
    disposals: [],
    currentRepair: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRepair: (state, action) => {
      state.currentRepair = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get repairs
      .addCase(getRepairs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRepairs.fulfilled, (state, action) => {
        state.loading = false;
        state.repairs = action.payload;
      })
      .addCase(getRepairs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get repair by ID
      .addCase(getRepairById.fulfilled, (state, action) => {
        state.currentRepair = action.payload;
      })
      // Complete repair
      .addCase(completeRepair.fulfilled, (state, action) => {
        const index = state.repairs.findIndex(
          (repair) => repair.id === action.payload.id
        );
        if (index !== -1) {
          state.repairs[index] = {
            ...state.repairs[index],
            ...action.payload.data,
          };
        }
      })
      // Fail repair
      .addCase(failRepair.fulfilled, (state, action) => {
        const index = state.repairs.findIndex(
          (repair) => repair.id === action.payload.id
        );
        if (index !== -1) {
          state.repairs[index] = {
            ...state.repairs[index],
            ...action.payload.data,
          };
        }
      })
      // Get disposals
      .addCase(getDisposals.fulfilled, (state, action) => {
        state.disposals = action.payload;
      })
      // Dispose equipment
      .addCase(disposeEquipment.fulfilled, (state, action) => {
        state.disposals.push(action.payload);
      });
  },
});

export const { clearError, setCurrentRepair } = repairSlice.actions;
export default repairSlice.reducer;
