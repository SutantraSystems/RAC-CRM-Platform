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

// ---- Activity ----
export const getStudentActivity = (studentId) => {
  return axiosInstance.get(`${STUDENTS_URL}/${studentId}/activity/`);
};