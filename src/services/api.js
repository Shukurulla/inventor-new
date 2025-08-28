import axios from "axios";

const BASE_URL = "https://server.kerek.uz";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store refresh promise to avoid multiple refresh calls
let refreshPromise = null;

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to refresh token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${BASE_URL}/user/login/refresh/`, {
      refresh: refreshToken,
    });

    const newToken = response.data.access;
    localStorage.setItem("token", newToken);

    // Update default headers
    api.defaults.headers.Authorization = `Bearer ${newToken}`;

    return newToken;
  } catch (error) {
    // Clear tokens if refresh fails
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw error;
  }
};

// Auto refresh token every 50 minutes (10 minutes before expiry)
const startTokenRefreshTimer = () => {
  setInterval(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await refreshToken();
        console.log("Token automatically refreshed");
      } catch (error) {
        console.error("Auto token refresh failed:", error);
      }
    }
  }, 50 * 60 * 1000); // 50 minutes
};

// Start the timer when the app loads
startTokenRefreshTimer();

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use shared refresh promise to avoid multiple refresh calls
        if (!refreshPromise) {
          refreshPromise = refreshToken();
        }

        const newToken = await refreshPromise;
        refreshPromise = null;

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/user/login/", credentials),
  refreshToken: (data) => api.post("/user/login/refresh/", data),
  getUserActions: () => api.get("/inventory/equipment/my-actions/"),
  register: (userData) => api.post("/user/user/", userData),
  updateProfile: (userData) => api.put("/user/profile/", userData),
  getProfile: async () => await api.get("/user/users/me"),
};

// University API
export const universityAPI = {
  getBuildings: () => api.get("/university/buildings/"),
  getFloorsByBuilding: (buildingId) =>
    api.get(`/university/buildings/${buildingId}/floors/`),
  getRoomsByBuilding: (buildingId) =>
    api.get(`/university/rooms/?building_id=${buildingId}`),
  getEquipmentTypesByRoom: async (roomId) => {
    try {
      const response = await api.get(
        `/inventory/equipment/equipment-by-room/${roomId}/`
      );

      const equipment = response.data.equipment || response.data || [];
      const groupedByType = {};

      equipment.forEach((item) => {
        const typeId = item.type_data?.id || item.type;
        const typeName = item.type_data?.name || "Неизвестный тип";

        if (!groupedByType[typeId]) {
          groupedByType[typeId] = {
            type: {
              id: typeId,
              name: typeName,
            },
            count: 0,
            items: [],
          };
        }

        groupedByType[typeId].count++;
        groupedByType[typeId].items.push(item);
      });

      return {
        data: Object.values(groupedByType),
      };
    } catch (error) {
      console.error("Ошибка при получении оборудования комнаты:", error);
      return { data: [] };
    }
  },
  getRoomInfo: (roomId) => api.get(`/university/rooms/${roomId}/`),
  getUniversities: () => api.get("/university/"),
  getFloors: () => api.get("/university/floors/"),
  getRooms: () => api.get("/university/rooms/"),
};

// Equipment API
export const equipmentAPI = {
  getEquipmentTypes: () => api.get("/inventory/equipment-types/"),
  getEquipment: (params = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, String(value));
      }
    });
    const query = queryString.toString();
    return api.get(`/inventory/equipment/filter/${query ? `?${query}` : ""}`);
  },
  getEquipmentByRoom: (roomId) =>
    api.get(`/inventory/equipment/equipment-by-room/${roomId}/`),
  getMyEquipments: () => api.get("/inventory/equipment/my-equipments/"),
  getFilteredEquipments: (params = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, String(value));
      }
    });
    const query = queryString.toString();
    return api.get(`/inventory/equipment/filter/${query ? `?${query}` : ""}`);
  },
  createEquipmentBulk: (data) =>
    api.post("/inventory/equipment/bulk-create/", data),

  // Updated updateEquipment method that properly handles both file and non-file data
  updateEquipment: (id, data) => {
    // Check if data contains file
    const hasFile = Object.values(data).some((value) => value instanceof File);

    if (hasFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      return api.patch(`/inventory/equipment/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // Return the API call for non-file data
    return api.patch(`/inventory/equipment/${id}/`, data);
  },

  patchEquipment: (id, data) => {
    // Check if data contains file
    const hasFile = Object.values(data).some((value) => value instanceof File);

    if (hasFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      return api.patch(`/inventory/equipment/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return api.patch(`/inventory/equipment/${id}/`, data);
  },

  deleteEquipment: (id) => api.delete(`/inventory/equipment/${id}/`),
  deleteEquipments: (ids) =>
    api.delete("/inventory/equipment/bulk-delete/", {
      data: { ids },
    }),
  sendToRepair: (id) => api.post(`/inventory/equipment/${id}/send-to-repair/`),
  disposeEquipment: (id, data) =>
    api.post(`/inventory/equipment/${id}/dispose/`, data),

  // Original bulkUpdateInn method
  bulkUpdateInn: (data) =>
    api.post("/inventory/equipment/bulk-update-inn/", data),

  // NEW: Enhanced method to include image with INN update
  bulkUpdateInnWithImage: (data) => {
    // Check if data contains image
    const hasImage = data.image instanceof File;

    if (hasImage) {
      const formData = new FormData();

      // Add equipments data
      formData.append("equipments", JSON.stringify(data.equipments));

      // Add image
      formData.append("photo", data.image);

      return api.post("/inventory/equipment/bulk-update-inn/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // If no image, use regular JSON
    return api.post("/inventory/equipment/bulk-update-inn/", {
      equipments: data.equipments,
    });
  },

  bulkUpdateStatus: (data) =>
    api.post("/inventory/equipment/bulk-update-status/", data),
  moveEquipment: (data) =>
    api.post("/inventory/equipment/move-equipment/", data),
  scanQR: (qrData) =>
    api.post("/inventory/equipment/scan-qr/", { qr_data: qrData }),
  getEquipmentById: (id) => api.get(`/inventory/equipment/${id}/`),
  getMovementHistory: () => api.get("/inventory/movement-history/"),
};

// INN Templates API - NEW
export const innTemplatesAPI = {
  getTemplates: () => api.get("/inventory/inn-templates/"),
  createTemplate: (data) => api.post("/inventory/inn-templates/", data),
  deleteTemplate: (id) => api.delete(`/inventory/inn-templates/${id}/`),
};

export const specificationsAPI = {
  // Computer specifications
  getComputerSpecs: () => api.get("/inventory/computer-specification/"),
  createComputerSpec: (data) =>
    api.post("/inventory/computer-specification/", data),
  updateComputerSpec: (id, data) =>
    api.patch(`/inventory/computer-specification/${id}/`, data),
  deleteComputerSpec: (id) =>
    api.delete(`/inventory/computer-specification/${id}/`),

  // Projector specifications
  getProjectorSpecs: () => api.get("/inventory/projector-specification/"),
  createProjectorSpec: (data) =>
    api.post("/inventory/projector-specification/", data),
  updateProjectorSpec: (id, data) =>
    api.patch(`/inventory/projector-specification/${id}/`, data),
  deleteProjectorSpec: (id) =>
    api.delete(`/inventory/projector-specification/${id}/`),

  // Printer specifications
  getPrinterSpecs: () => api.get("/inventory/printer-specification/"),
  createPrinterSpec: (data) =>
    api.post("/inventory/printer-specification/", data),
  updatePrinterSpec: (id, data) =>
    api.patch(`/inventory/printer-specification/${id}/`, data),
  deletePrinterSpec: (id) =>
    api.delete(`/inventory/printer-specification/${id}/`),

  // TV specifications
  getTVSpecs: () => api.get("/inventory/tv-specification/"),
  createTVSpec: (data) => api.post("/inventory/tv-specification/", data),
  updateTVSpec: (id, data) =>
    api.patch(`/inventory/tv-specification/${id}/`, data),
  deleteTVSpec: (id) => api.delete(`/inventory/tv-specification/${id}/`),

  // Router specifications
  getRouterSpecs: () => api.get("/inventory/router-specification/"),
  createRouterSpec: (data) =>
    api.post("/inventory/router-specification/", data),
  updateRouterSpec: (id, data) =>
    api.patch(`/inventory/router-specification/${id}/`, data),
  deleteRouterSpec: (id) =>
    api.delete(`/inventory/router-specification/${id}/`),

  // Notebook specifications
  getNotebookSpecs: () => api.get("/inventory/notebook-specification/"),
  createNotebookSpec: (data) =>
    api.post("/inventory/notebook-specification/", data),
  updateNotebookSpec: (id, data) =>
    api.patch(`/inventory/notebook-specification/${id}/`, data),
  deleteNotebookSpec: (id) =>
    api.delete(`/inventory/notebook-specification/${id}/`),

  // Monoblok specifications
  getMonoblokSpecs: () => api.get("/inventory/monoblok-specification/"),
  createMonoblokSpec: (data) =>
    api.post("/inventory/monoblok-specification/", data),
  updateMonoblokSpec: (id, data) =>
    api.patch(`/inventory/monoblok-specification/${id}/`, data),
  deleteMonoblokSpec: (id) =>
    api.delete(`/inventory/monoblok-specification/${id}/`),

  // Whiteboard specifications
  getWhiteboardSpecs: () => api.get("/inventory/whiteboard-specification/"),
  createWhiteboardSpec: (data) =>
    api.post("/inventory/whiteboard-specification/", data),
  updateWhiteboardSpec: (id, data) =>
    api.patch(`/inventory/whiteboard-specification/${id}/`, data),
  deleteWhiteboardSpec: (id) =>
    api.delete(`/inventory/whiteboard-specification/${id}/`),

  // Extender specifications
  getExtenderSpecs: () => api.get("/inventory/extender-specification/"),
  createExtenderSpec: (data) =>
    api.post("/inventory/extender-specification/", data),
  updateExtenderSpec: (id, data) =>
    api.patch(`/inventory/extender-specification/${id}/`, data),
  deleteExtenderSpec: (id) =>
    api.delete(`/inventory/extender-specification/${id}/`),

  // Monitor specifications
  getMonitorSpecs: () => api.get("/inventory/monitor-specification/"),
  createMonitorSpec: (data) =>
    api.post("/inventory/monitor-specification/", data),
  updateMonitorSpec: (id, data) =>
    api.patch(`/inventory/monitor-specification/${id}/`, data),
  deleteMonitorSpec: (id) =>
    api.delete(`/inventory/monitor-specification/${id}/`),

  // Get specification count
  getSpecificationCount: () =>
    api.get("/inventory/specifications/specification-count/"),
};

// Contracts API
export const contractsAPI = {
  getContracts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/inventory/contracts/`);
  },
  createContract: (formData) => {
    return api.post("/inventory/contracts/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateContract: (id, formData) => {
    return api.patch(`/inventory/contracts/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteContract: (id) => api.delete(`/inventory/contracts/${id}/`),
};

// Repairs API
export const repairsAPI = {
  getRepairs: () => api.get("/inventory/repairs/"),
  getRepairById: (id) => api.get(`/inventory/repairs/${id}/`),
  completeRepair: (id) => api.post(`/inventory/repairs/${id}/complete/`),
  failRepair: (id) => api.post(`/inventory/repairs/${id}/fail/`),

  // Disposals
  getDisposals: () => api.get("/inventory/disposals/"),
  getDisposalById: (id) => api.get(`/inventory/disposals/${id}/`),
  disposeEquipment: (id, data) =>
    api.post(`/inventory/equipment/${id}/dispose/`, data),
};

export default api;
