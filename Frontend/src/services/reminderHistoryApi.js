import axiosInstance from "../api/axiosInstance";

const HISTORY_URL = "/students/reminders/history";

export const reminderHistoryApi = {
  list: (params = {}) => axiosInstance.get(`${HISTORY_URL}/`, { params }),
  summary: (params = {}) => axiosInstance.get(`${HISTORY_URL}/summary/`, { params }),
  users: () => axiosInstance.get(`${HISTORY_URL}/users/`),
  ids: (params = {}) => axiosInstance.get(`${HISTORY_URL}/ids/`, { params }),
  bulkRemove: (ids) => axiosInstance.delete("/students/reminders/bulk-delete/", { data: { ids } }),
};