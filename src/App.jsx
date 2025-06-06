import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CharacteristicsPage from "./pages/CharacteristicsPage";
import ContractsPage from "./pages/ContractsPage";
import AddedPage from "./pages/AddedPage";
import RepairsPage from "./pages/RepairsPage";
import SettingsPage from "./pages/SettingsPage";
import { initializeTheme } from "./store/slices/settingsSlice";

function App() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Initialize theme and other settings on app start
  useEffect(() => {
    dispatch(initializeTheme());

    // Listen for system theme changes when using system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e) => {
      const currentTheme = localStorage.getItem("theme");
      if (currentTheme === "system") {
        const body = document.body;
        if (e.matches) {
          body.classList.add("dark-theme");
          document.documentElement.classList.add("dark");
        } else {
          body.classList.remove("dark-theme");
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addListener(handleSystemThemeChange);

    return () => {
      mediaQuery.removeListener(handleSystemThemeChange);
    };
  }, [dispatch]);

  if (!token) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/characteristics" element={<CharacteristicsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/added" element={<AddedPage />} />
        <Route path="/repairs" element={<RepairsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
