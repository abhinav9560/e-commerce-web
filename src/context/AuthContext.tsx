import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import API from "../api/axios"; // Your configured axios instance

// Define types for user and context
type User = {
  id: string;
  email: string;
  fullName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
    profile?: {
    address: string | null;
    avatar: string | null;
    dateOfBirth: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
  };

} | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  isAuthenticated: boolean;
  requestSignupOtp: (email: string) => Promise<void>;
  requestLoginOtp: (email: string) => Promise<void>;
  verifySignupOtp: (email: string, otp: string) => Promise<void>;
  verifyLoginOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string, type: "signup" | "login") => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  signout: () => Promise<void>;
  deactivateAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  requestSignupOtp: async () => {},
  requestLoginOtp: async () => {},
  verifySignupOtp: async () => {},
  verifyLoginOtp: async () => {},
  resendOtp: async () => {},
  updateProfile: async () => {},
  refreshAccessToken: async () => {},
  signout: async () => {},
  deactivateAccount: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Computed property for authentication status
  const isAuthenticated = Boolean(user);

  // Load user from localStorage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");

        if (storedUser && token) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // Only verify profile in production or if explicitly needed
            // Remove automatic profile verification during initialization
            // This prevents logout during hot reloads in development
            if (import.meta.env.VITE_NODE_ENV === 'production') {
              try {
                await getProfile();
              } catch (error) {
                console.error("Profile verification failed:", error);
                // Only clear data if it's a definitive auth failure (403/401)
                // and not a network/server error
                if (error.response?.status === 403 || 
                    (error.response?.status === 401 && error.response?.data?.message?.includes('invalid'))) {
                  clearAuthData();
                }
              }
            }
          } catch (parseError) {
            console.error("Failed to parse stored user data:", parseError);
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper function to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Get user profile
  const getProfile = async () => {
    try {
      const response = await API.get("/auth/profile");
      if (response.data.success) {
        const userData = response.data.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to get profile:", error);
      throw error;
    }
  };

  // Request OTP for signup
  const requestSignupOtp = async (email: string) => {
    try {
      const response = await API.post("/auth/signup/send-otp", { email });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Failed to send OTP";
      throw new Error(message);
    }
  };

  // Request OTP for login
  const requestLoginOtp = async (email: string) => {
    try {
      const response = await API.post("/auth/login/send-otp", { email });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Failed to send OTP";
      throw new Error(message);
    }
  };

  // Verify OTP and complete signup
  const verifySignupOtp = async (email: string, otp: string) => {
    try {
      const payload: any = { email, otp };

      const response = await API.post("/auth/signup/verify-otp", payload);

      if (response.data.success) {
        const {
          tokens: { accessToken, refreshToken },
          user: userData,
        } = response.data.data;
        // Store tokens and user data
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
      } else {
        throw new Error(response.data.message || "Signup verification failed");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Signup verification failed";
      throw new Error(message);
    }
  };

  // Verify OTP and complete login
  const verifyLoginOtp = async (email: string, otp: string) => {
    try {
      const response = await API.post("/auth/login/verify-otp", { email, otp });

      if (response.data.success) {
        const {
          tokens: { accessToken, refreshToken },
          user: userData,
        } = response.data.data;

        // Store tokens and user data
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
      } else {
        throw new Error(response.data.message || "Login verification failed");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login verification failed";
      throw new Error(message);
    }
  };

  // Resend OTP
  const resendOtp = async (email: string, type: "signup" | "login") => {
    try {
      const response = await API.post("/auth/resend-otp", { email, type });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend OTP";
      throw new Error(message);
    }
  };

  // Update user profile - Modified to handle both JSON and FormData
  const updateProfile = async (profileData: Partial<User> | FormData) => {
    try {
      let config = {};

      // Check if profileData is FormData (for file uploads)
      if (profileData instanceof FormData) {
        config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      }

      const response = await API.put("/auth/profile", profileData, config);

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      throw new Error(message);
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await API.post("/auth/refresh-token", { refreshToken });

      if (response.data.success) {
        const { accessToken: newAccessToken } = response.data;
        localStorage.setItem("accessToken", newAccessToken);
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      // If refresh fails, logout user
      await signout();
      throw error;
    }
  };

  // Sign out user
  const signout = async () => {
    try {
      // Try to logout on server (optional, won't fail if it doesn't work)
      try {
        await API.post("/auth/logout");
      } catch (error) {
        console.log("Server logout failed, continuing with local logout");
      }
    } finally {
      // Always clear local data
      clearAuthData();
    }
  };

  // Deactivate account
  const deactivateAccount = async () => {
    try {
      const response = await API.delete("/auth/deactivate");

      if (response.data.success) {
        // Clear all data after successful deactivation
        clearAuthData();
      } else {
        throw new Error(
          response.data.message || "Failed to deactivate account"
        );
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to deactivate account";
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        requestSignupOtp,
        requestLoginOtp,
        verifySignupOtp,
        verifyLoginOtp,
        resendOtp,
        updateProfile,
        refreshAccessToken,
        signout,
        deactivateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);