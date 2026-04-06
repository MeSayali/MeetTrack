/**
 * Upload Service
 * Handles file upload and meeting processing API calls
 */

import api from "./api";

export const uploadService = {
  /**
   * Upload audio file
   */
  async uploadAudio(file) {
    try {
      const response = await api.uploadFile("/audio", file);
      return response;
    } catch (error) {
      throw new Error(error.message || "Audio upload failed");
    }
  },

  /**
   * Process uploaded file for meeting analysis
   */
  async processFile(filePath, fileName) {
    try {
      const response = await api.post("/process", {
        file_path: filePath,
        file_name: fileName,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "File processing failed");
    }
  },

  /**
   * Get meeting details by ID
   */
  async getMeeting(meetingId) {
    try {
      const response = await api.get(`/meeting/${meetingId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get meeting");
    }
  },

  /**
   * Get all meetings for current user
   */
  async getMeetings() {
    try {
      const response = await api.get("/meetings");
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get meetings");
    }
  },

  /**
   * Get meeting transcript
   */
  async getTranscript(meetingId) {
    try {
      const response = await api.get(`/meeting/${meetingId}/transcript`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get transcript");
    }
  },

  /**
   * Get meeting summary
   */
  async getSummary(meetingId) {
    try {
      const response = await api.get(`/meeting/${meetingId}/summary`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to get summary");
    }
  },
};

export default uploadService;
