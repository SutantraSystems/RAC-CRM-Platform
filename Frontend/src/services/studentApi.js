import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/students/";

export const getStudents = (page = 1) => {
  return axios.get(`${API_URL}?page=${page}`);
};

export const createStudent = (studentData) => {
  return axios.post(API_URL, studentData);
};

export const updateStudent = (id, studentData) => {
  return axios.put(`${API_URL}${id}/`, studentData);
};

export const deleteStudent = (id) => {
  return axios.delete(`${API_URL}${id}/`);
};

export const getStudentById = (id) => {
  return axios.get(`${API_URL}${id}/`);
};

export const uploadStudentsExcel = (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return axios.post(
    "http://127.0.0.1:8000/api/upload-students/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

