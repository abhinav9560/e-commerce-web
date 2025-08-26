import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Add token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens and automatic refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (refreshToken) {
          // Try to refresh the token
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/auth/refresh-token`,
            { refreshToken }
          );

          if (refreshResponse.data.success) {
            const { accessToken } = refreshResponse.data;
            
            // Update stored token
            localStorage.setItem("accessToken", accessToken);
            
            // Update the authorization header for the original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            // Retry the original request
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // If refresh fails or no refresh token, clear everything
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Only force reload in production or if not in development mode
      // This prevents logout loops during development hot reloads
      if (process.env.NODE_ENV === 'production') {
        window.location.reload();
      } else {
        // In development, just log the issue instead of forcing reload
        console.warn("Auth token refresh failed in development mode. User will need to login again.");
        
        // Optionally dispatch a custom event that your app can listen to
        window.dispatchEvent(new CustomEvent('auth-refresh-failed'));
      }
    }

    return Promise.reject(error);
  }
);

export default API;