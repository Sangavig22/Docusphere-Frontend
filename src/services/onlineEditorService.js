import { request } from "../api/apiClient";

/**
 * Creates a new blank document of the specified type.
 * @param {string} name - Name of the document (without extension is fine).
 * @param {string} type - Document type: 'word', 'spreadsheet' (or 'cell'), or 'presentation' (or 'slide').
 * @returns {Promise<{ documentId: string, editorConfig: object }>}
 */
export async function createOnlineDocument(name, type) {
  return request("/online-editor/create", {
    method: "POST",
    body: JSON.stringify({ name, type }),
  });
}
