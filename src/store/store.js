import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import universitySlice from "./slices/universitySlice";
import equipmentSlice from "./slices/equipmentSlice";
import contractSlice from "./slices/contractSlice";
import specificationSlice from "./slices/specificationSlice";
import repairSlice from "./slices/repairSlice";
import settingsSlice from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    university: universitySlice,
    equipment: equipmentSlice,
    contracts: contractSlice,
    specifications: specificationSlice,
    repairs: repairSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});
