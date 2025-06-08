import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { universityAPI } from "../../services/api";

// Async thunks
export const getBuildings = createAsyncThunk(
  "university/getBuildings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getBuildings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getFloorsByBuilding = createAsyncThunk(
  "university/getFloorsByBuilding",
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getFloorsByBuilding(buildingId);
      return {
        buildingId,
        floors: response.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// YANGI: Факультетларни олиш
export const getFacultiesByBuilding = createAsyncThunk(
  "university/getFacultiesByBuilding",
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getFacultiesByBuilding(buildingId);
      return {
        buildingId,
        faculties: response.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRoomsByBuilding = createAsyncThunk(
  "university/getRoomsByBuilding",
  async (buildingId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getRoomsByBuilding(buildingId);
      return {
        buildingId,
        rooms: response.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getEquipmentTypesByRoom = createAsyncThunk(
  "university/getEquipmentTypesByRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getEquipmentTypesByRoom(roomId);
      return {
        roomId,
        equipmentTypes: response.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Бошқа async thunks...
export const getUniversities = createAsyncThunk(
  "university/getUniversities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getUniversities();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getFloors = createAsyncThunk(
  "university/getFloors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getFloors();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRooms = createAsyncThunk(
  "university/getRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getRooms();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRoomInfo = createAsyncThunk(
  "university/getRoomInfo",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await universityAPI.getRoomInfo(roomId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Асосий маълумотлар
  universities: [],
  buildings: [],
  floors: [],
  rooms: [],

  // Корпус бўйича гуруҳланган маълумотлар
  floorsByBuilding: {}, // { buildingId: [floors] }
  facultiesByBuilding: {}, // { buildingId: [faculties] } - YANGI
  roomsByBuilding: {}, // { buildingId: [rooms] }

  // Хона бўйича жиҳозлар
  equipmentTypesByRoom: {}, // { roomId: [equipmentTypes] }

  // Танланган элементлар
  selectedBuilding: null,
  selectedFloor: null,
  selectedFaculty: null, // YANGI
  selectedRoom: null,

  // Статуслар
  loading: false,
  error: null,
};

const universitySlice = createSlice({
  name: "university",
  initialState,
  reducers: {
    setSelectedBuilding: (state, action) => {
      state.selectedBuilding = action.payload;
      state.selectedFloor = null;
      state.selectedFaculty = null;
      state.selectedRoom = null;
    },
    setSelectedFloor: (state, action) => {
      state.selectedFloor = action.payload;
      state.selectedFaculty = null;
      state.selectedRoom = null;
    },
    setSelectedFaculty: (state, action) => {
      state.selectedFaculty = action.payload;
      state.selectedRoom = null;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUniversityData: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // getBuildings
      .addCase(getBuildings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBuildings.fulfilled, (state, action) => {
        state.loading = false;
        state.buildings = action.payload;
      })
      .addCase(getBuildings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getFloorsByBuilding
      .addCase(getFloorsByBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFloorsByBuilding.fulfilled, (state, action) => {
        state.loading = false;
        const { buildingId, floors } = action.payload;
        state.floorsByBuilding[buildingId] = floors;
      })
      .addCase(getFloorsByBuilding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getFacultiesByBuilding - YANGI
      .addCase(getFacultiesByBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFacultiesByBuilding.fulfilled, (state, action) => {
        state.loading = false;
        const { buildingId, faculties } = action.payload;
        state.facultiesByBuilding[buildingId] = faculties;
      })
      .addCase(getFacultiesByBuilding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getRoomsByBuilding
      .addCase(getRoomsByBuilding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomsByBuilding.fulfilled, (state, action) => {
        state.loading = false;
        const { buildingId, rooms } = action.payload;
        state.roomsByBuilding[buildingId] = rooms;
      })
      .addCase(getRoomsByBuilding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getEquipmentTypesByRoom
      .addCase(getEquipmentTypesByRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEquipmentTypesByRoom.fulfilled, (state, action) => {
        state.loading = false;
        const { roomId, equipmentTypes } = action.payload;
        state.equipmentTypesByRoom[roomId] = equipmentTypes;
      })
      .addCase(getEquipmentTypesByRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getUniversities
      .addCase(getUniversities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUniversities.fulfilled, (state, action) => {
        state.loading = false;
        state.universities = action.payload;
      })
      .addCase(getUniversities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getFloors
      .addCase(getFloors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFloors.fulfilled, (state, action) => {
        state.loading = false;
        state.floors = action.payload;
      })
      .addCase(getFloors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getRooms
      .addCase(getRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getRoomInfo
      .addCase(getRoomInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRoom = action.payload;
      })
      .addCase(getRoomInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedBuilding,
  setSelectedFloor,
  setSelectedFaculty,
  setSelectedRoom,
  clearError,
  clearUniversityData,
} = universitySlice.actions;

export default universitySlice.reducer;
