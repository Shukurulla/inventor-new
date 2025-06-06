import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { contractsAPI } from "../../services/api";

// Get contracts
export const getContracts = createAsyncThunk(
  "contracts/getContracts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await contractsAPI.getContracts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create contract
export const createContract = createAsyncThunk(
  "contracts/createContract",
  async (contractData, { rejectWithValue }) => {
    try {
      const response = await contractsAPI.createContract(contractData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update contract
export const updateContract = createAsyncThunk(
  "contracts/updateContract",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await contractsAPI.updateContract(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete contract
export const deleteContract = createAsyncThunk(
  "contracts/deleteContract",
  async (id, { rejectWithValue }) => {
    try {
      await contractsAPI.deleteContract(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const contractSlice = createSlice({
  name: "contracts",
  initialState: {
    contracts: [],
    loading: false,
    error: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get contracts
      .addCase(getContracts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload.results || action.payload;
        state.pagination = {
          current: action.payload.current_page || 1,
          pageSize: action.payload.page_size || 10,
          total: action.payload.total || action.payload.length || 0,
        };
      })
      .addCase(getContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create contract
      .addCase(createContract.pending, (state) => {
        state.loading = true;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts.unshift(action.payload);
      })
      .addCase(createContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update contract
      .addCase(updateContract.fulfilled, (state, action) => {
        const index = state.contracts.findIndex(
          (contract) => contract.id === action.payload.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
      })
      // Delete contract
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.contracts = state.contracts.filter(
          (contract) => contract.id !== action.payload
        );
      });
  },
});

export const { clearError } = contractSlice.actions;
export default contractSlice.reducer;
