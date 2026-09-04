import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const STUDENTS_URL = `${API_URL}/students`;

// Get students with pagination and filters
export const getStudents = (params = {}) => {
  return axios.get(`${STUDENTS_URL}/`, {
    params,
  });
};

// Get single student
export const getStudentById = (id) => {
  return axios.get(`${STUDENTS_URL}/${id}/`);
};

// Create student
export const createStudent = (studentData) => {
  return axios.post(`${STUDENTS_URL}/`, studentData);
};

// Update student
export const updateStudent = (id, studentData) => {
  return axios.put(`${STUDENTS_URL}/${id}/`, studentData);
};

// Delete student
export const deleteStudent = (id) => {
  return axios.delete(`${STUDENTS_URL}/${id}/`);
};

// Upload Excel files
export const uploadStudentsExcel = (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return axios.post(
    `${API_URL}/upload-students/`,
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
  return axios.get(`${API_URL}/students-count/`, {
    params,
  });
};