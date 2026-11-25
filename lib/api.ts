import axios from "axios";

const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");
const API_URL = configuredApiUrl.endsWith("/api/v1")
	? configuredApiUrl
	: configuredApiUrl.endsWith("/api")
		? `${configuredApiUrl}/v1`
		: `${configuredApiUrl}/api/v1`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sustainx_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && body.success === true && "data" in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sustainx_token");
      localStorage.removeItem("sustainx_user");
      window.dispatchEvent(new Event("sustainx:auth-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
