import { request } from "../api/apiClient";

export const commentService = {
  async getComments(documentId) {
    return request(`/comments/${documentId}`, {
      method: "GET",
    });
  },

  async addComment(documentId, userId, message) {
    return request("/comments", {
      method: "POST",
      body: JSON.stringify({
        documentId,
        userId,
        message,
      }),
    });
  },
};
