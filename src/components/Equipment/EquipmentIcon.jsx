import React from "react";
import {
  FiMonitor,
  FiPrinter,
  FiTv,
  FiWifi,
  FiTablet,
  FiLayers,
} from "react-icons/fi";
import { BsProjector, BsLaptop, BsDisplay, BsPlug } from "react-icons/bs";

const EquipmentIcon = ({ type, className = "text-lg" }) => {
  const getIcon = () => {
    const typeLower = type?.toLowerCase() || "";

    if (typeLower.includes("проектор")) {
      return <BsProjector className={`icon-projector ${className}`} />;
    }
    if (typeLower.includes("компьютер")) {
      return <FiMonitor className={`icon-computer ${className}`} />;
    }
    if (typeLower.includes("принтер")) {
      return <FiPrinter className={`icon-printer ${className}`} />;
    }
    if (typeLower.includes("монитор")) {
      return <BsDisplay className={`icon-monitor ${className}`} />;
    }
    if (typeLower.includes("телевизор")) {
      return <FiTv className={`icon-tv ${className}`} />;
    }
    if (typeLower.includes("роутер") || typeLower.includes("router")) {
      return <FiWifi className={`icon-router ${className}`} />;
    }
    if (typeLower.includes("ноутбук")) {
      return <BsLaptop className={`icon-notebook ${className}`} />;
    }
    if (typeLower.includes("моноблок")) {
      return <BsDisplay className={`icon-monoblok ${className}`} />;
    }
    if (typeLower.includes("доска") || typeLower.includes("электронная")) {
      return <FiTablet className={`icon-whiteboard ${className}`} />;
    }
    if (typeLower.includes("удлинитель") || typeLower.includes("extender")) {
      return <BsPlug className={`icon-extender ${className}`} />;
    }

    return <FiLayers className={`text-gray-500 ${className}`} />;
  };

  return getIcon();
};

export default EquipmentIcon;
