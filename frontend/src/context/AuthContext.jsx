import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./authContextObject";
import { authService } from "../services/authService";

const STORAGE_KEY_TOKEN = "access_token";
const STORAGE_KEY_USER = "meettrack-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        const token = localStorage.getItem(STORAGE_KEY_TOKEN);

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Register user
   */
  const register = useCallback(async (email, password, fullName = "", role = "employee") => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.register(email, password, fullName, role);

      const userData = {
        id: response.id,
        email: response.email,
        full_name: response.full_name || "",
        name: response.full_name || email.split("@")[0],
        role: response.role,
      };

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      setUser(userData);

      return response;
    } catch (err) {
      const errorMsg = err.message || "Registration failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login(email, password);

      // Store token
      authService.setAccessToken(response.access_token);

      // Store user data
      const userData = {
        id: response.user_id || 1,
        email: response.email,
        name: response.full_name || email.split("@")[0],
        full_name: response.full_name || "",
        role: response.role || "employee",
      };

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      setUser(userData);

      return response;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    try {
      authService.logout();
      localStorage.removeItem(STORAGE_KEY_USER);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      setLoading(true);

      if (!user) throw new Error("No user logged in");

      const response = await authService.updateProfile(user.id, profileData);

      const updatedUser = {
        ...user,
        ...response,
      };

      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return response;
    } catch (err) {
      const errorMsg = err.message || "Failed to update profile";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      register,
      updateProfile,
      clearError,
      isAuthenticated: !!user,
    }),
    [user, loading, error, login, logout, register, updateProfile, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

