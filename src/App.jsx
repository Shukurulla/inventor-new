import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CharacteristicsPage from "./pages/CharacteristicsPage";
import ContractsPage from "./pages/ContractsPage";
import AddedPage from "./pages/AddedPage";
import RepairsPage from "./pages/RepairsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const { token } = useSelector((state) => state.auth);

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
