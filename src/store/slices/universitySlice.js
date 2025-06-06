import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { universityAPI } from "../../services/api";

// Get buildings
export const getBuildings = createAsyncThunk(
  "university/getBuildings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getBuildings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get floors by building
export const getFloorsByBuilding = createAsyncThunk(
  "university/getFloorsByBuilding",
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getFloorsByBuilding(buildingId);
      return { buildingId, floors: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get rooms by building
export const getRoomsByBuilding = createAsyncThunk(
  "university/getRoomsByBuilding",
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getRoomsByBuilding(buildingId);
      return { buildingId, rooms: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get equipment types by room
export const getEquipmentTypesByRoom = createAsyncThunk(
  "university/getEquipmentTypesByRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getEquipmentTypesByRoom(roomId);
      return { roomId, equipmentTypes: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const universitySlice = createSlice({
  name: "university",
  initialState: {
    buildings: [],
    floorsByBuilding: {},
    roomsByBuilding: {},
    equipmentTypesByRoom: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get buildings
      .addCase(getBuildings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBuildings.fulfilled, (state, action) => {
        state.loading = false;
        state.buildings = action.payload;
      })
      .addCase(getBuildings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get floors by building
      .addCase(getFloorsByBuilding.fulfilled, (state, action) => {
        state.floorsByBuilding[action.payload.buildingId] =
          action.payload.floors;
      })
      // Get rooms by building
      .addCase(getRoomsByBuilding.fulfilled, (state, action) => {
        state.roomsByBuilding[action.payload.buildingId] = action.payload.rooms;
      })
      // Get equipment types by room
      .addCase(getEquipmentTypesByRoom.fulfilled, (state, action) => {
        state.equipmentTypesByRoom[action.payload.roomId] =
          action.payload.equipmentTypes;
      });
  },
});

export const { clearError } = universitySlice.actions;
export default universitySlice.reducer;
