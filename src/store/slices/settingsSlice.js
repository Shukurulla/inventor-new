import { createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    theme: localStorage.getItem("theme") || "light",
    fontSize: localStorage.getItem("fontSize") || "sf-pro",
    language: localStorage.getItem("language") || "ru",
    notifications: JSON.parse(localStorage.getItem("notifications") || "true"),
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);

      // Apply theme to document
      const body = document.body;
      if (action.payload === "dark") {
        body.classList.add("dark-theme");
        document.documentElement.classList.add("dark");
      } else if (action.payload === "light") {
        body.classList.remove("dark-theme");
        document.documentElement.classList.remove("dark");
      } else if (action.payload === "system") {
        // Check system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) {
          body.classList.add("dark-theme");
          document.documentElement.classList.add("dark");
        } else {
          body.classList.remove("dark-theme");
          document.documentElement.classList.remove("dark");
        }
      }
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem("fontSize", action.payload);

      // Apply font family to document
      const fontFamilies = {
        "sf-pro":
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        inter: "'Inter', system-ui, sans-serif",
        roboto: "'Roboto', system-ui, sans-serif",
      };

      const body = document.body;
      body.style.fontFamily =
        fontFamilies[action.payload] || fontFamilies["sf-pro"];

      // Add class for additional styling
      body.classList.remove("font-sf-pro", "font-inter", "font-roboto");
      body.classList.add(`font-${action.payload}`);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem("language", action.payload);

      // Update document language
      document.documentElement.lang = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      localStorage.setItem("notifications", JSON.stringify(action.payload));
    },
    initializeTheme: (state) => {
      // Initialize theme on app start
      const savedTheme = state.theme;
      const body = document.body;

      if (savedTheme === "dark") {
        body.classList.add("dark-theme");
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) {
          body.classList.add("dark-theme");
          document.documentElement.classList.add("dark");
        }
      }

      // Initialize font
      const savedFont = state.fontSize;
      const fontFamilies = {
        "sf-pro":
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        inter: "'Inter', system-ui, sans-serif",
        roboto: "'Roboto', system-ui, sans-serif",
      };

      body.style.fontFamily = fontFamilies[savedFont] || fontFamilies["sf-pro"];
      body.classList.add(`font-${savedFont}`);

      // Initialize language
      document.documentElement.lang = state.language;
    },
  },
});

export const {
  setTheme,
  setFontSize,
  setLanguage,
  setNotifications,
  initializeTheme,
} = settingsSlice.actions;

export default settingsSlice.reducer;
