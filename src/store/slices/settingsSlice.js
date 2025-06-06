import { createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    theme: localStorage.getItem("theme") || "light",
    fontSize: localStorage.getItem("fontSize") || "medium",
    language: localStorage.getItem("language") || "ru",
    notifications: JSON.parse(localStorage.getItem("notifications") || "true"),
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);

      // Apply theme to document
      if (action.payload === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem("fontSize", action.payload);

      // Apply font size to document
      const sizes = {
        small: "14px",
        medium: "16px",
        large: "18px",
      };
      document.documentElement.style.fontSize = sizes[action.payload];
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem("language", action.payload);
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      localStorage.setItem("notifications", JSON.stringify(action.payload));
    },
  },
});

export const { setTheme, setFontSize, setLanguage, setNotifications } =
  settingsSlice.actions;
export default settingsSlice.reducer;
