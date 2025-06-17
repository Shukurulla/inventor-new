// src/store/slices/innTemplateSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { innTemplatesAPI } from "../../services/api";

// Get INN templates
export const getInnTemplates = createAsyncThunk(
  "innTemplates/getInnTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await innTemplatesAPI.getTemplates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create INN template
export const createInnTemplate = createAsyncThunk(
  "innTemplates/createInnTemplate",
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await innTemplatesAPI.createTemplate(templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete INN template
export const deleteInnTemplate = createAsyncThunk(
  "innTemplates/deleteInnTemplate",
  async (id, { rejectWithValue }) => {
    try {
      await innTemplatesAPI.deleteTemplate(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const innTemplateSlice = createSlice({
  name: "innTemplates",
  initialState: {
    templates: [],
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
      // Get templates
      .addCase(getInnTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInnTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(getInnTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create template
      .addCase(createInnTemplate.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInnTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.push(action.payload);
      })
      .addCase(createInnTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete template
      .addCase(deleteInnTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(
          (template) => template.id !== action.payload
        );
      });
  },
});

export const { clearError } = innTemplateSlice.actions;
export default innTemplateSlice.reducer;
