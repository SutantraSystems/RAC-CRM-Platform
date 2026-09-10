import axiosInstance from "../api/axiosInstance";

const STUDENTS_URL = "/students";

// Get students with pagination and filters
export const getStudents = (params = {}) => {
  return axiosInstance.get(`${STUDENTS_URL}/`, {
    params,
  });
};

// Get single student
export const getStudentById = (id) => {
  return axiosInstance.get(`${STUDENTS_URL}/${id}/`);
};

// Create student
export const createStudent = (studentData) => {
  return axiosInstance.post(`${STUDENTS_URL}/`, studentData);
};

// Update student
export const updateStudent = (id, studentData) => {
  return axiosInstance.put(`${STUDENTS_URL}/${id}/`, studentData);
};

// Delete student
export const deleteStudent = (id) => {
  return axiosInstance.delete(`${STUDENTS_URL}/${id}/`);
};

// Upload Excel files
export const uploadStudentsExcel = (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return axiosInstance.post(
    `${STUDENTS_URL}/upload/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Get student count
export const getStudentCount = (params = {}) => {
  return axiosInstance.get(`${STUDENTS_URL}/count/`, {
    params,
  });
};