/**
 * Action Item Service
 * Handles action item management API calls
 */

import api from "./api";

export const actionItemService = {
  /**
   * Get all action items for a meeting
   */
  async getActionItems(meetingId) {
    try {
      const response = await api.get(`/action-items?meeting_id=${meetingId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get action items");
    }
  },

  /**
   * Get action item by ID
   */
  async getActionItem(itemId) {
    try {
      const response = await api.get(`/action-items/${itemId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get action item");
    }
  },

  /**
   * Create new action item
   */
  async createActionItem(data) {
    try {
      const response = await api.post("/action-items", data);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to create action item");
    }
  },

  /**
   * Update action item
   */
  async updateActionItem(itemId, data) {
    try {
      const response = await api.put(`/action-items/${itemId}`, data);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to update action item");
    }
  },

  /**
   * Update action item status
   */
  async updateStatus(itemId, status) {
    try {
      const response = await api.put(`/action-items/${itemId}`, { status });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to update status");
    }
  },

  /**
   * Delete action item
   */
  async deleteActionItem(itemId) {
    try {
      const response = await api.delete(`/action-items/${itemId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to delete action item");
    }
  },

  /**
   * Get all user's action items
   */
  async getUserActionItems() {
    try {
      const response = await api.get("/action-items/me");
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get user action items");
    }
  },
};

export default actionItemService;
