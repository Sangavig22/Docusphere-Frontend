import { request } from "../api/apiClient.js";
import { API_BASE_URL } from "../config/api.js";
import authService from "./authService.js";

export async function renameDocument(id, name) {
  const trimmedName = String(name || "").trim();
  return request(`/documents/${id}/rename`, {
    method: "PUT",
    // Keep payload backward-compatible with different backend contracts.
    body: JSON.stringify({
      name: trimmedName,
      newName: trimmedName,
      documentName: trimmedName,
    }),
  });
}

export async function moveDocument(id, destination) {
  return request(`/documents/${id}/move`, {
    method: "PUT",
    body: JSON.stringify(destination),
  });
}

export async function duplicateDocument(id) {
  return request(`/documents/${id}/duplicate`, {
    method: "POST",
  });
}

export async function trashDocument(id) {
  return request(`/documents/${id}/trash`, {
    method: "DELETE",
  });
}

export async function restoreDocumentApi(id) {
  return request(`/documents/${id}/restore`, {
    method: "POST",
  });
}

export async function getTeams() {
  return request("/teams", { method: "GET" });
}

export async function permanentlyDeleteDocument(id) {
  return request(`/documents/${id}/permanent`, {
    method: "DELETE",
  });
}

export async function downloadDocument(id, name = "document") {
  const token = authService.getToken();
  const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
