import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { equipmentAPI } from "../../services/api";

// Get equipment types
export const getEquipmentTypes = createAsyncThunk(
  "equipment/getEquipmentTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getEquipmentTypes();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get equipment list
export const getEquipment = createAsyncThunk(
  "equipment/getEquipment",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getEquipment(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get equipment by room
export const getEquipmentByRoom = createAsyncThunk(
  "equipment/getEquipmentByRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getEquipmentByRoom(roomId);
      return { roomId, equipment: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create equipment bulk
export const createEquipmentBulk = createAsyncThunk(
  "equipment/createEquipmentBulk",
  async (equipmentData, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.createEquipmentBulk(equipmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update equipment
export const updateEquipment = createAsyncThunk(
  "equipment/updateEquipment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.updateEquipment(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete equipment
export const deleteEquipment = createAsyncThunk(
  "equipment/deleteEquipment",
  async (id, { rejectWithValue }) => {
    try {
      await equipmentAPI.deleteEquipment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Send to repair
export const sendToRepair = createAsyncThunk(
  "equipment/sendToRepair",
  async (id, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.sendToRepair(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Bulk update INN
export const bulkUpdateInn = createAsyncThunk(
  "equipment/bulkUpdateInn",
  async (equipments, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.bulkUpdateInn({ equipments });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const equipmentSlice = createSlice({
  name: "equipment",
  initialState: {
    equipmentTypes: [],
    equipment: [],
    equipmentByRoom: {},
    currentEquipment: null,
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
    setCurrentEquipment: (state, action) => {
      state.currentEquipment = action.payload;
    },
    clearCurrentEquipment: (state) => {
      state.currentEquipment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get equipment types
      .addCase(getEquipmentTypes.fulfilled, (state, action) => {
        state.equipmentTypes = action.payload;
      })
      // Get equipment
      .addCase(getEquipment.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = action.payload.results || action.payload;
        state.pagination = {
          current: action.payload.current_page || 1,
          pageSize: action.payload.page_size || 10,
          total: action.payload.total || action.payload.length || 0,
        };
      })
      .addCase(getEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get equipment by room
      .addCase(getEquipmentByRoom.fulfilled, (state, action) => {
        state.equipmentByRoom[action.payload.roomId] = action.payload.equipment;
      })
      // Create equipment bulk
      .addCase(createEquipmentBulk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEquipmentBulk.fulfilled, (state, action) => {
        state.loading = false;
        state.equipment = [...state.equipment, ...action.payload];
      })
      .addCase(createEquipmentBulk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update equipment
      .addCase(updateEquipment.fulfilled, (state, action) => {
        const index = state.equipment.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.equipment[index] = action.payload;
        }
      })
      // Delete equipment
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.equipment = state.equipment.filter(
          (item) => item.id !== action.payload
        );
      });
  },
});

export const { clearError, setCurrentEquipment, clearCurrentEquipment } =
  equipmentSlice.actions;
export default equipmentSlice.reducer;
