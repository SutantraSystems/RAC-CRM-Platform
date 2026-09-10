import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

function getCookie(name) {
    const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
}

axiosInstance.interceptors.request.use((config) => {
    const method = (config.method || "get").toLowerCase();
    if (!["get", "head", "options"].includes(method)) {
        const csrfToken = getCookie("csrftoken");
        if (csrfToken) {
            config.headers["X-CSRFToken"] = csrfToken;
        }
    }
    return config;
});

export default axiosInstance;