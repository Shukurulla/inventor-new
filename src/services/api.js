import axios from "axios";

const BASE_URL = "https://invenmaster.pythonanywhere.com";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${BASE_URL}/user/login/refresh/`, {
          refresh: refreshToken,
        });

        const newToken = response.data.access;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
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
  getProfile: () => api.get("/user/profile/"),
};

// University API - FIXED
export const universityAPI = {
  // 1. Корпуслар
  getBuildings: () => api.get("/university/buildings/"),

  // 2. Этажлар (корпус бўйича)
  getFloorsByBuilding: (buildingId) =>
    api.get(`/university/buildings/${buildingId}/floors/`),

  // 3. Хоналар (корпус бўйича)
  getRoomsByBuilding: (buildingId) =>
    api.get(`/university/rooms/?building_id=${buildingId}`),

  // 4. Оборудование типлари (хона бўйича)
  getEquipmentTypesByRoom: async (roomId) => {
    try {
      // Сначала пробуем получить оборудование по комнате
      const response = await api.get(
        `/inventory/equipment/equipment-by-room/${roomId}/`
      );

      // Группируем по типам
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
      // Возвращаем пустой массив вместо ошибки
      return { data: [] };
    }
  },

  // Бошқа методлар
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

      return api.put(`/inventory/equipment/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return api.put(`/inventory/equipment/${id}/`, data);
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
  bulkUpdateInn: (data) =>
    api.post("/inventory/equipment/bulk-update-inn/", data),
  bulkUpdateStatus: (data) =>
    api.post("/inventory/equipment/bulk-update-status/", data),
  moveEquipment: (data) =>
    api.post("/inventory/equipment/move-equipment/", data),
  scanQR: (qrData) =>
    api.post("/inventory/equipment/scan-qr/", { qr_data: qrData }),
  getEquipmentById: (id) => api.get(`/inventory/equipment/${id}/`),
  getMovementHistory: () => api.get("/inventory/movement-history/"),
};

export const specificationsAPI = {
  // Computer specifications
  getComputerSpecs: () => api.get("/inventory/computer-specifications/"),
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

  // Get specification count
  getSpecificationCount: () =>
    api.get("/inventory/specifications/specification-count/"),
};

// Contracts API
export const contractsAPI = {
  getContracts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(
      `/inventory/contracts/${queryString ? `?${queryString}` : ""}`
    );
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
