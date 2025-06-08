// utils/statusUtils.js

export const getStatusConfig = (status) => {
  const statusConfigs = {
    NEW: {
      text: "Новое",
      color: "#52c41a",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
    },
    WORKING: {
      text: "Работает",
      color: "#1890ff",
      bgColor: "#e6f7ff",
      borderColor: "#91d5ff",
    },
    REPAIR: {
      text: "На ремонте",
      color: "#fa8c16",
      bgColor: "#fff7e6",
      borderColor: "#ffd591",
    },
    NEEDS_REPAIR: {
      text: "Требуется ремонт",
      color: "#ff4d4f",
      bgColor: "#fff2f0",
      borderColor: "#ffb3b3",
    },
    DISPOSED: {
      text: "Утилизировано",
      color: "#8c8c8c",
      bgColor: "#f5f5f5",
      borderColor: "#d9d9d9",
    },
  };

  return (
    statusConfigs[status] || {
      text: status,
      color: "#d9d9d9",
      bgColor: "#fafafa",
      borderColor: "#d9d9d9",
    }
  );
};

export const getStatusBadge = (status, count) => {
  const config = getStatusConfig(status);

  return {
    count,
    style: {
      backgroundColor: config.color,
      color: "white",
      border: `1px solid ${config.color}`,
    },
    title: config.text,
  };
};
