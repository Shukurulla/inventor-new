import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Spin } from "antd";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CharacteristicsPage from "./pages/CharacteristicsPage";
import ContractsPage from "./pages/ContractsPage";
import AddedPage from "./pages/AddedPage";
import RepairsPage from "./pages/RepairsPage";
import SettingsPage from "./pages/SettingsPage";
import { initializeTheme } from "./store/slices/settingsSlice";

// Import all async actions for centralized loading
import { getUserActions } from "./store/slices/authSlice";
import {
  getBuildings,
  getUniversities,
  getFloors,
  getRooms,
} from "./store/slices/universitySlice";
import {
  getEquipmentTypes,
  getMyEquipments,
} from "./store/slices/equipmentSlice";
import { getContracts } from "./store/slices/contractSlice";
import {
  getAllSpecifications,
  getSpecificationCount,
} from "./store/slices/specificationSlice";
import { LogoLight } from "../public";

function App() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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

  // Centralized data loading when user is authenticated
  useEffect(() => {
    if (token && !isDataLoaded) {
      loadAllApplicationData();
    }
  }, [token, isDataLoaded]);

  const loadAllApplicationData = async () => {
    setIsAppLoading(true);
    console.log("🚀 Starting centralized data loading...");

    try {
      // Load all essential data in parallel for better performance
      const loadingPromises = [
        // Auth related data
        dispatch(getUserActions()),

        // University structure data
        dispatch(getBuildings()),
        dispatch(getUniversities()),
        dispatch(getFloors()),
        dispatch(getRooms()),

        // Equipment related data
        dispatch(getEquipmentTypes()),
        dispatch(getMyEquipments()),

        // Contract data
        dispatch(getContracts()),

        // Specifications data
        dispatch(getAllSpecifications()),
        dispatch(getSpecificationCount()),
      ];

      // Wait for all essential data to load
      await Promise.allSettled(loadingPromises);

      console.log("✅ All application data loaded successfully");
      setIsDataLoaded(true);
    } catch (error) {
      console.error("❌ Error loading application data:", error);
      // Even if some data fails, mark as loaded to prevent infinite loading
      setIsDataLoaded(true);
    } finally {
      setIsAppLoading(false);
    }
  };

  // Reset data loaded state when user logs out
  useEffect(() => {
    if (!token) {
      setIsDataLoaded(false);
    }
  }, [token]);

  if (!token) {
    return <LoginPage />;
  }

  // Show loading screen while essential data is being loaded
  if (isAppLoading && !isDataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Загрузка данных приложения...</p>
        </div>
      </div>
    );
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
