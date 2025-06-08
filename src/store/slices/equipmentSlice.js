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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get equipment list with filters
export const getEquipment = createAsyncThunk(
  "equipment/getEquipment",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getEquipment(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get filtered equipment
export const getFilteredEquipment = createAsyncThunk(
  "equipment/getFilteredEquipment",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getFilteredEquipments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get my equipment
export const getMyEquipments = createAsyncThunk(
  "equipment/getMyEquipments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getMyEquipments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get equipment by ID
export const getEquipmentById = createAsyncThunk(
  "equipment/getEquipmentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getEquipmentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Patch equipment
export const patchEquipment = createAsyncThunk(
  "equipment/patchEquipment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.patchEquipment(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete multiple equipments
export const deleteEquipments = createAsyncThunk(
  "equipment/deleteEquipments",
  async (ids, { rejectWithValue }) => {
    try {
      await equipmentAPI.deleteEquipments(ids);
      return ids;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Send to repair
export const sendToRepair = createAsyncThunk(
  "equipment/sendToRepair",
  async (id, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.sendToRepair(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Dispose equipment
export const disposeEquipment = createAsyncThunk(
  "equipment/disposeEquipment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.disposeEquipment(id, data);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Bulk update INN
export const bulkUpdateInn = createAsyncThunk(
  "equipment/bulkUpdateInn",
  async (data, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.bulkUpdateInn(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Bulk update status
export const bulkUpdateStatus = createAsyncThunk(
  "equipment/bulkUpdateStatus",
  async (data, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.bulkUpdateStatus(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Move equipment
export const moveEquipment = createAsyncThunk(
  "equipment/moveEquipment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.moveEquipment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Scan QR code
export const scanQRCode = createAsyncThunk(
  "equipment/scanQRCode",
  async (qrData, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.scanQR(qrData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get movement history
export const getMovementHistory = createAsyncThunk(
  "equipment/getMovementHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await equipmentAPI.getMovementHistory();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const equipmentSlice = createSlice({
  name: "equipment",
  initialState: {
    equipmentTypes: [],
    equipment: [],
    myEquipments: [],
    filteredEquipment: [],
    equipmentByRoom: {},
    currentEquipment: null,
    movementHistory: [],
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
    clearEquipmentData: (state) => {
      state.equipment = [];
      state.myEquipments = [];
      state.filteredEquipment = [];
      state.equipmentByRoom = {};
      state.currentEquipment = null;
      state.movementHistory = [];
    },
    updateEquipmentInList: (state, action) => {
      const updatedEquipment = action.payload;

      // Update in equipment array
      const equipmentIndex = state.equipment.findIndex(
        (item) => item.id === updatedEquipment.id
      );
      if (equipmentIndex !== -1) {
        state.equipment[equipmentIndex] = updatedEquipment;
      }

      // Update in myEquipments array
      const myEquipmentIndex = state.myEquipments.findIndex(
        (item) => item.id === updatedEquipment.id
      );
      if (myEquipmentIndex !== -1) {
        state.myEquipments[myEquipmentIndex] = updatedEquipment;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get equipment types
      .addCase(getEquipmentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipmentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.equipmentTypes = action.payload;
      })
      .addCase(getEquipmentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get equipment
      .addCase(getEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipment.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both paginated and non-paginated responses
        if (action.payload.results) {
          state.equipment = action.payload.results;
          state.pagination = {
            current: action.payload.current_page || 1,
            pageSize: action.payload.page_size || 10,
            total: action.payload.total || 0,
          };
        } else if (Array.isArray(action.payload)) {
          state.equipment = action.payload;
          state.pagination = {
            current: 1,
            pageSize: 10,
            total: action.payload.length,
          };
        } else {
          state.equipment = action.payload;
        }
      })
      .addCase(getEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get filtered equipment
      .addCase(getFilteredEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFilteredEquipment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.results) {
          state.filteredEquipment = action.payload.results;
        } else if (Array.isArray(action.payload)) {
          state.filteredEquipment = action.payload;
        } else {
          state.filteredEquipment = action.payload;
        }
      })
      .addCase(getFilteredEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get my equipments
      .addCase(getMyEquipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyEquipments.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.myEquipments = action.payload;
        } else if (
          action.payload.results &&
          Array.isArray(action.payload.results)
        ) {
          state.myEquipments = action.payload.results;
        } else if (action.payload.data && Array.isArray(action.payload.data)) {
          state.myEquipments = action.payload.data;
        } else {
          state.myEquipments = [];
        }
      })
      .addCase(getMyEquipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get equipment by room
      .addCase(getEquipmentByRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEquipmentByRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.equipmentByRoom[action.payload.roomId] = action.payload.equipment;
      })
      .addCase(getEquipmentByRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get equipment by ID
      .addCase(getEquipmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEquipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEquipment = action.payload;
      })
      .addCase(getEquipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create equipment bulk
      .addCase(createEquipmentBulk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEquipmentBulk.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.equipment = [...state.equipment, ...action.payload];
          state.myEquipments = [...state.myEquipments, ...action.payload];
        } else {
          state.equipment.push(action.payload);
          state.myEquipments.push(action.payload);
        }
      })
      .addCase(createEquipmentBulk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update equipment
      .addCase(updateEquipment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.loading = false;

        // Update in equipment array
        const equipmentIndex = state.equipment.findIndex(
          (item) => item.id === action.payload.id
        );
        if (equipmentIndex !== -1) {
          state.equipment[equipmentIndex] = action.payload;
        }

        // Update in myEquipments array
        const myEquipmentIndex = state.myEquipments.findIndex(
          (item) => item.id === action.payload.id
        );
        if (myEquipmentIndex !== -1) {
          state.myEquipments[myEquipmentIndex] = action.payload;
        }

        // Update current equipment if it matches
        if (
          state.currentEquipment &&
          state.currentEquipment.id === action.payload.id
        ) {
          state.currentEquipment = action.payload;
        }
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Patch equipment
      .addCase(patchEquipment.pending, (state) => {
        state.loading = true;
      })
      .addCase(patchEquipment.fulfilled, (state, action) => {
        state.loading = false;

        // Update in equipment array
        const equipmentIndex = state.equipment.findIndex(
          (item) => item.id === action.payload.id
        );
        if (equipmentIndex !== -1) {
          state.equipment[equipmentIndex] = action.payload;
        }

        // Update in myEquipments array
        const myEquipmentIndex = state.myEquipments.findIndex(
          (item) => item.id === action.payload.id
        );
        if (myEquipmentIndex !== -1) {
          state.myEquipments[myEquipmentIndex] = action.payload;
        }

        // Update current equipment if it matches
        if (
          state.currentEquipment &&
          state.currentEquipment.id === action.payload.id
        ) {
          state.currentEquipment = action.payload;
        }
      })
      .addCase(patchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete equipment
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.equipment = state.equipment.filter(
          (item) => item.id !== action.payload
        );
        state.myEquipments = state.myEquipments.filter(
          (item) => item.id !== action.payload
        );

        // Clear current equipment if it was deleted
        if (
          state.currentEquipment &&
          state.currentEquipment.id === action.payload
        ) {
          state.currentEquipment = null;
        }
      })

      // Delete equipments
      .addCase(deleteEquipments.fulfilled, (state, action) => {
        state.equipment = state.equipment.filter(
          (item) => !action.payload.includes(item.id)
        );
        state.myEquipments = state.myEquipments.filter(
          (item) => !action.payload.includes(item.id)
        );

        // Clear current equipment if it was deleted
        if (
          state.currentEquipment &&
          action.payload.includes(state.currentEquipment.id)
        ) {
          state.currentEquipment = null;
        }
      })

      // Send to repair
      .addCase(sendToRepair.fulfilled, (state, action) => {
        const { id } = action.payload;

        // Update equipment status to 'REPAIR'
        const equipmentIndex = state.equipment.findIndex(
          (item) => item.id === id
        );
        if (equipmentIndex !== -1) {
          state.equipment[equipmentIndex].status = "REPAIR";
        }

        const myEquipmentIndex = state.myEquipments.findIndex(
          (item) => item.id === id
        );
        if (myEquipmentIndex !== -1) {
          state.myEquipments[myEquipmentIndex].status = "REPAIR";
        }
      })

      // Dispose equipment
      .addCase(disposeEquipment.fulfilled, (state, action) => {
        const { id } = action.payload;

        // Update equipment status to 'DISPOSED'
        const equipmentIndex = state.equipment.findIndex(
          (item) => item.id === id
        );
        if (equipmentIndex !== -1) {
          state.equipment[equipmentIndex].status = "DISPOSED";
        }

        const myEquipmentIndex = state.myEquipments.findIndex(
          (item) => item.id === id
        );
        if (myEquipmentIndex !== -1) {
          state.myEquipments[myEquipmentIndex].status = "DISPOSED";
        }
      })

      // Bulk update INN
      .addCase(bulkUpdateInn.fulfilled, (state, action) => {
        // Refresh equipment data after bulk update
        // The actual update will be handled by re-fetching data
      })

      // Bulk update status
      .addCase(bulkUpdateStatus.fulfilled, (state, action) => {
        // Refresh equipment data after bulk update
        // The actual update will be handled by re-fetching data
      })

      // Move equipment
      .addCase(moveEquipment.fulfilled, (state, action) => {
        // Refresh equipment data after move
        // The actual update will be handled by re-fetching data
      })

      // Scan QR code
      .addCase(scanQRCode.fulfilled, (state, action) => {
        state.currentEquipment = action.payload;
      })

      // Get movement history
      .addCase(getMovementHistory.fulfilled, (state, action) => {
        state.movementHistory = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentEquipment,
  clearCurrentEquipment,
  clearEquipmentData,
  updateEquipmentInList,
} = equipmentSlice.actions;

export default equipmentSlice.reducer;
