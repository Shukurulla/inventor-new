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
};

// University API
export const universityAPI = {
  getBuildings: () => api.get("/university/buildings/"),
  getFloorsByBuilding: (buildingId) =>
    api.get(`/university/buildings/${buildingId}/floors/`),
  getRoomsByBuilding: (buildingId) =>
    api.get(`/university/rooms/?building_id=${buildingId}`),
  getEquipmentTypesByRoom: (roomId) =>
    api.get(`/inventory/equipment/by-room/${roomId}/types/`),
  getRoomInfo: (roomId) => api.get(`/university/rooms/${roomId}/`),
};

// Equipment API
export const equipmentAPI = {
  getEquipmentTypes: () => api.get("/inventory/equipment-types/"),
  getEquipment: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/inventory/equipment/filter/?${queryString}`);
  },
  getEquipmentByRoom: (roomId) =>
    api.get(`/inventory/equipment/equipment-by-room/${roomId}/`),
  createEquipmentBulk: (data) =>
    api.post("/inventory/equipment/bulk-create/", data),
  updateEquipment: (id, data) => api.put(`/inventory/equipment/${id}/`, data),
  deleteEquipment: (id) => api.delete(`/inventory/equipment/${id}/`),
  sendToRepair: (id) => api.post(`/inventory/equipment/${id}/send-to-repair/`),
  bulkUpdateInn: (data) =>
    api.post("/inventory/equipment/bulk-update-inn/", data),
  scanQR: (qrData) =>
    api.post("/inventory/equipment/scan-qr/", { qr_data: qrData }),
  moveEquipment: (data) =>
    api.post("/inventory/equipment/move-equipment/", data),
};

// Specifications API
export const specificationsAPI = {
  // Computer specifications
  getComputerSpecs: () => api.get("/inventory/computer-specifications/"),
  createComputerSpec: (data) => api.post("/inventory/create-comp-spec/", data),

  // Projector specifications
  getProjectorSpecs: () => api.get("/inventory/projector-specification/"),
  createProjectorSpec: (data) =>
    api.post("/inventory/projector-specification/", data),

  // Printer specifications
  getPrinterSpecs: () => api.get("/inventory/printer-specification/"),
  createPrinterSpec: (data) =>
    api.post("/inventory/printer-specification/", data),

  // TV specifications
  getTVSpecs: () => api.get("/inventory/tv-specification/"),
  createTVSpec: (data) => api.post("/inventory/tv-specification/", data),

  // Router specifications
  getRouterSpecs: () => api.get("/inventory/router-specification/"),
  createRouterSpec: (data) =>
    api.post("/inventory/router-specification/", data),

  // Notebook specifications
  getNotebookSpecs: () => api.get("/inventory/notebook-specification/"),
  createNotebookSpec: (data) =>
    api.post("/inventory/notebook-specification/", data),

  // Monoblok specifications
  getMonoblokSpecs: () => api.get("/inventory/monoblok-specification/"),
  createMonoblokSpec: (data) =>
    api.post("/inventory/monoblok-specification/", data),

  // Whiteboard specifications
  getWhiteboardSpecs: () => api.get("/inventory/whiteboard-specification/"),
  createWhiteboardSpec: (data) =>
    api.post("/inventory/whiteboard-specification/", data),

  // Extender specifications
  getExtenderSpecs: () => api.get("/inventory/extender-specification/"),
  createExtenderSpec: (data) =>
    api.post("/inventory/extender-specification/", data),

  // Get specification count
  getSpecificationCount: () =>
    api.get("/inventory/specifications/specification-count/"),
};

// Contracts API
export const contractsAPI = {
  getContracts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/inventory/contracts/?${queryString}`);
  },
  createContract: (formData) => {
    return api.post("/inventory/contracts/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateContract: (id, formData) => {
    return api.put(`/inventory/contracts/${id}/`, formData, {
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
