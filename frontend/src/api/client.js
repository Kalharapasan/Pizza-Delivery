import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolvePending(token) {
  pendingQueue.forEach(({ resolve }) => resolve(token));
  pendingQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && localStorage.getItem("refresh_token")) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingQueue.push({ resolve });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          original._retry = true;
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        const { data } = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          params: { refresh },
        });
        localStorage.setItem("access_token", data.access);
        resolvePending(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
