
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Attach Authorization header on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("Token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 errors and redirect safely with HashRouter
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // clear stored auth data
      localStorage.removeItem("Token");

      window.location.assign("/login");
      // (Alternative: export your router instance and use router.navigate('/login'))
    }
    return Promise.reject(error);
  }
);

export default api;
