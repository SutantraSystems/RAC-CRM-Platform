import axiosInstance from "../api/axiosInstance";

const STUDENTS_URL = "/students";

// ---- Documents ----
export const getStudentDocuments = (studentId) => {
  return axiosInstance.get(`${STUDENTS_URL}/${studentId}/documents/`);
};

export const uploadStudentDocument = (studentId, file, documentType) => {
  const formData = new FormData();
  formData.append("file", file);
  if (documentType) {
    formData.append("document_type", documentType);
  }

  return axiosInstance.post(
    `${STUDENTS_URL}/${studentId}/documents/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteStudentDocument = (documentId) => {
  return axiosInstance.delete(`${STUDENTS_URL}/documents/${documentId}/`);
};

// ---- Comments ----
export const getStudentComments = (studentId) => {
  return axiosInstance.get(`${STUDENTS_URL}/${studentId}/comments/`);
};

export const addStudentComment = (studentId, comment) => {
  return axiosInstance.post(`${STUDENTS_URL}/${studentId}/comments/`, {
    comment,
  });
};

export const deleteStudentComment = (commentId) => {
  return axiosInstance.delete(`${STUDENTS_URL}/comments/${commentId}/`);
};

// ---- Reminders (shared by everyone in RAC; separate from comments) ----
export const getStudentReminders = (studentId) => {
  return axiosInstance.get(`${STUDENTS_URL}/${studentId}/reminders/`);
};

// data: { title, remind_at (ISO string), notes }
export const addStudentReminder = (studentId, data) => {
  return axiosInstance.post(`${STUDENTS_URL}/${studentId}/reminders/`, data);
};

export const updateStudentReminder = (reminderId, data) => {
  return axiosInstance.patch(`${STUDENTS_URL}/reminders/${reminderId}/`, data);
};

export const completeStudentReminder = (reminderId) => {
  return axiosInstance.post(`${STUDENTS_URL}/reminders/${reminderId}/complete/`);
};

export const rescheduleStudentReminder = (reminderId, remindAt) => {
  return axiosInstance.post(
    `${STUDENTS_URL}/reminders/${reminderId}/reschedule/`,
    { remind_at: remindAt }
  );
};

export const deleteStudentReminder = (reminderId) => {
  return axiosInstance.delete(`${STUDENTS_URL}/reminders/${reminderId}/`);
};

// Navbar bell: all Due + Overdue reminders across every student.
export const getReminderNotifications = () => {
  return axiosInstance.get(`${STUDENTS_URL}/reminders/notifications/`);
};

// ---- Activity ----
export const getStudentActivity = (studentId) => {
  return axiosInstance.get(`${STUDENTS_URL}/${studentId}/activity/`);
};