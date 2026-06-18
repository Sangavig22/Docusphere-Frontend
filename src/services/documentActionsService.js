import { request } from "../api/apiClient.js";
import { API_BASE_URL } from "../config/api.js";

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

export async function moveDocument(id, destination = {}) {
  const payload =
    destination?.teamId == null || destination?.teamId === ""
      ? {}
      : { teamId: String(destination.teamId) };
  return request(`/documents/${id}/move`, {
    method: "PUT",
    body: JSON.stringify(payload),
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

export async function downloadDocument(id, name = "document", { password, unlockToken } = {}) {
  const params = new URLSearchParams();
  if (password) params.set("password", password);
  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/documents/${id}/download${query ? `?${query}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        ...(password ? { "X-Document-Password": password } : {}),
        ...(unlockToken ? { "X-Unlock-Token": unlockToken } : {}),
      },
    },
  );

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

export async function shareDocumentByEmail(id, payload) {
  return request(`/documents/${id}/share`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
