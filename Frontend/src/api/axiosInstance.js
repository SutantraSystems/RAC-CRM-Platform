import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const [key, ...value] = cookie.trim().split("=");

        if (key === name) {
            return decodeURIComponent(value.join("="));
        }
    }

    return null;
}

axiosInstance.interceptors.request.use(
    (config) => {
        const method = (config.method || "get").toLowerCase();

        if (!["get", "head", "options"].includes(method)) {
            const csrfToken = getCookie("csrftoken");

            if (csrfToken) {
                config.headers["X-CSRFToken"] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;