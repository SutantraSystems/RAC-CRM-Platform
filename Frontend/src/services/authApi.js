import axiosInstance from "../api/axiosInstance";

export const registerUser = async (data) => {
    const response = await axiosInstance.post(
        "/auth/register/",
        data
    );

    return response.data;
};

export const loginUser = async (data) => {
    const response = await axiosInstance.post(
        "/auth/login/",
        data
    );

    return response.data;
};

export const logoutUser = async () => {
    const response = await axiosInstance.post(
        "/auth/logout/"
    );

    return response.data;
};

export const getCurrentUser = async () => {
    const response = await axiosInstance.get(
        "/auth/me/"
    );

    return response.data;
};

export const checkEmailExists = async (email) => {
    const response = await axiosInstance.post(
        "/auth/forgot-password/check-email/",
        { email }
    );

    return response.data;
};

export const resetPassword = async (data) => {
    const response = await axiosInstance.post(
        "/auth/forgot-password/reset/",
        data
    );

    return response.data;
};

export const deleteStudents = (ids) => {
  return axiosInstance.delete(`${STUDENTS_URL}/bulk-delete/`, {
    data: { ids },
  });
};