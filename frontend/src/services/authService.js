/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api from "./api";

export const authService = {
  /**
   * Register a new user
   */
  async register(email, password, full_name = "", role = "employee") {
    try {
      const response = await api.post("/register", {
        email,
        password,
        full_name,
        role,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  },

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const formData = new FormData();
      formData.append("username", email); // FastAPI OAuth2 expects 'username'
      formData.append("password", password);

      const token = localStorage.getItem("access_token");
      const headers = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/login`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Login failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  },

  /**
   * Logout user (clear local token)
   */
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  /**
   * Get current user profile
   */
  async getUserProfile(userId) {
    try {
      const response = await api.get(`/profile/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get profile");
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    try {
      const response = await api.put(`/profile/${userId}`, profileData);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to update profile");
    }
  },

  /**
   * Get access token from storage
   */
  getAccessToken() {
    return localStorage.getItem("access_token");
  },

  /**
   * Store access token
   */
  setAccessToken(token) {
    localStorage.setItem("access_token", token);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem("access_token");
  },
};

export default authService;
