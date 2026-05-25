import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (error) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    const isAuthEndpoint = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/logout",
    ].some((path) => requestUrl.includes(path));

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve,
          reject,
        });
      }).then(() => api(originalRequest));
    }

    isRefreshing = true;

    try {
      await refreshClient.post("/auth/refresh");
      resolvePendingRequests();
      return api(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;