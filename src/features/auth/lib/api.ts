import axios from "axios";

// 70 s — gives the full chain (browser → Next.js route → Render backend cold start) enough time.
// Render's free tier can take up to 60 s to wake from sleep.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // sends httpOnly auth_token cookie automatically
  timeout: 70000,
});

// Response interceptor: handle 401 auto-logout and global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // On 401, clear the session and redirect to login (skip if already on logout route)
    if (status === 401 && !error.config?.url?.includes("/auth/logout")) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // best-effort
      }
      window.location.href = "/login";
      return new Promise(() => {}); // prevent further error propagation
    }

    return Promise.reject(error);
  }
);

export const post = (url: string, data?: unknown) => api.post(url, data);
export const patch = (url: string, data?: unknown) => api.patch(url, data);
export const get = (url: string) => api.get(url);
export const put = (url: string, data?: unknown) => api.put(url, data);