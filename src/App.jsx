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

// Centralized data loading imports
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

  // OPTIMIZED: Centralized data loading - faqat bir marta token bor bo'lganda
  useEffect(() => {
    if (token && !isDataLoaded) {
      loadAllApplicationData();
    }
  }, [token, isDataLoaded]);

  // OPTIMIZED: Parallel data loading with proper error handling
  const loadAllApplicationData = async () => {
    setIsAppLoading(true);
    console.log("🚀 Starting optimized centralized data loading...");

    try {
      // Phase 1: Critical data that other components depend on
      const criticalDataPromises = [
        dispatch(getUserActions()),
        dispatch(getEquipmentTypes()),
        dispatch(getUniversities()),
        dispatch(getBuildings()),
      ];

      await Promise.allSettled(criticalDataPromises);
      console.log("✅ Phase 1: Critical data loaded");

      // Phase 2: General application data
      const generalDataPromises = [
        dispatch(getFloors()),
        dispatch(getRooms()),
        dispatch(getAllSpecifications()),
        dispatch(getSpecificationCount()),
        dispatch(getContracts()),
      ];

      await Promise.allSettled(generalDataPromises);
      console.log("✅ Phase 2: General data loaded");

      // Phase 3: User-specific data
      const userDataPromises = [dispatch(getMyEquipments())];

      await Promise.allSettled(userDataPromises);
      console.log("✅ Phase 3: User-specific data loaded");

      console.log("✅ All application data loaded successfully");
      setIsDataLoaded(true);
    } catch (error) {
      console.error("❌ Error loading application data:", error);
      // Mark as loaded even if some data fails to prevent infinite loading
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
          <p className="mt-2 text-gray-500 text-sm">
            Оптимизированная загрузка данных
          </p>
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
