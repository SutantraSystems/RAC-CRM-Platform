import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,

    withCredentials: true,
});

export function getCookie(name) {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const [key, ...value] = cookie.trim().split("=");

        if (key === name) {
            return decodeURIComponent(value.join("="));
        }
    }

    return null;
}

let csrfRequest = null;

export function ensureCsrfCookie() {
    if (getCookie("csrftoken")) {
        return Promise.resolve();
    }

    if (!csrfRequest) {
        csrfRequest = axiosInstance
            .get("/auth/csrf/")
            .catch(() => {})
            .finally(() => {
                csrfRequest = null;
            });
    }

    return csrfRequest;
}

axiosInstance.interceptors.request.use(
    async (config) => {
        const method = (config.method || "get").toLowerCase();

        if (!["get", "head", "options"].includes(method)) {
            await ensureCsrfCookie();

            const csrfToken = getCookie("csrftoken");

            if (csrfToken) {
                config.headers["X-CSRFToken"] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let sessionExpiredHandler = null;

// AuthContext registers its handler here. It lives outside React/Router,so the interceptor only *reports* expiry; ProtectedRoute does the redirect.
export function setSessionExpiredHandler(handler) {
    sessionExpiredHandler = handler;
}

// Requests whose 401/403 must NOT be read as "session expired":
function isAuthProbe(config) {
    const url = config?.url || "";
    const method = (config?.method || "get").toLowerCase();

    if (/\/auth\/(login|logout|csrf|register|forgot-password)\//.test(url)) {
        return true;
    }

    return method === "get" && /\/auth\/me\/?$/.test(url);
}

let verifyRequest = null;

function sessionIsInvalid() {
    if (!verifyRequest) {
        verifyRequest = axiosInstance
            .get("/auth/me/")
            .then((response) => response.data?.authenticated !== true)
            .catch((error) => {
                const status = error.response?.status;
                // Network failure => unknown. Don't kick the user out.
                return status === 401 || status === 403;
            })
            .finally(() => {
                verifyRequest = null;
            });
    }

    return verifyRequest;
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if ((status === 401 || status === 403) && !isAuthProbe(error.config)) {
            if (await sessionIsInvalid()) {
                sessionExpiredHandler?.();
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;