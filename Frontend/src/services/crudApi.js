import axiosInstance from "../api/axiosInstance";

export const createCrudApi = (basePath) => ({
  list: (params = {}) => axiosInstance.get(`${basePath}/`, { params }),
  get: (id) => axiosInstance.get(`${basePath}/${id}/`),
  create: (data) => axiosInstance.post(`${basePath}/`, data),
  update: (id, data) => axiosInstance.put(`${basePath}/${id}/`, data),
  patch: (id, data) => axiosInstance.patch(`${basePath}/${id}/`, data),
  remove: (id) => axiosInstance.delete(`${basePath}/${id}/`),
});