import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // proxies through Next API routes
  withCredentials: true,
});

// ✅ FIXED: Request interceptor to attach Bearer token from cookie
api.interceptors.request.use((config) => {
  // Try to get auth_token from document.cookie (client-side only)
  if (typeof document !== "undefined") {
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("auth_token="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 [API] Bearer token attached to request");
    }
  }
  return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || "Request failed";

    // Only show toast for non-auth errors or if explicitly needed
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      console.error("API Error:", message);
    }

    return Promise.reject(error);
  }
);

export const post = (url: string, data?: any) => api.post(url, data);
export const patch = (url: string, data?: any) => api.patch(url, data);
export const get = (url: string) => api.get(url);
export const put = (url: string, data?: any) => api.put(url, data);