/**
 * Result Service
 * Handles meeting results and analysis API calls
 */

import api from "./api";

export const resultService = {
  /**
   * Get all results for a meeting
   */
  async getMeetingResults(meetingId) {
    try {
      const response = await api.get(`/results/${meetingId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get results");
    }
  },

  /**
   * Get pending tasks
   */
  async getPendingTasks() {
    try {
      const response = await api.get("/results/pending/tasks");
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get pending tasks");
    }
  },

  /**
   * Get insights for dashboard
   */
  async getInsights() {
    try {
      const response = await api.get("/results/insights");
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get insights");
    }
  },

  /**
   * Get meeting statistics
   */
  async getMeetingStats() {
    try {
      const response = await api.get("/results/stats");
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get statistics");
    }
  },
};

export default resultService;
