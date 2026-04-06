/**
 * Base API Client Configuration
 * Handles all API requests with proper error handling and authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = API_TIMEOUT;
  }

  /**
   * Get authorization headers
   */
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Make a GET request
   */
  async get(endpoint, options = {}) {
    return this.request("GET", endpoint, null, options);
  }

  /**
   * Make a POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request("POST", endpoint, data, options);
  }

  /**
   * Make a PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request("PUT", endpoint, data, options);
  }

  /**
   * Make a DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request("DELETE", endpoint, null, options);
  }

  /**
   * Upload file(s)
   */
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append("file", file);

    // Add any additional data fields
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    const token = localStorage.getItem("access_token");
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Core request method
   */
  async request(method, endpoint, data = null, options = {}) {
    const { includeAuth = true, timeout = this.timeout } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(includeAuth);

    const requestConfig = {
      method,
      headers,
    };

    if (data) {
      requestConfig.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(
          responseData.detail || `HTTP ${response.status}`
        );
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }
}

export default new APIClient();
