import { request } from "../api/apiClient.js";
import { API_BASE_URL } from "../config/api.js";
import authService from "./authService.js";
import { parseUnlockSessionFromResponse } from "../utils/documentProtection.js";

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = (API_BASE_URL || "").trim();
  if (base === "/api" && normalizedPath.startsWith("/api/")) {
    return normalizedPath;
  }
  return `${base}${normalizedPath}`;
}

async function parseJsonResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }
  return data;
}

export async function protectDocument(id, password) {
  return request(`/documents/${id}/protect`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function removeDocumentProtection(id) {
  return request(`/documents/${id}/protect`, {
    method: "DELETE",
  });
}

export async function verifyDocumentPassword(id, password, { shareToken } = {}) {
  const params = new URLSearchParams();
  if (shareToken) params.set("token", shareToken);
  const query = params.toString();

  const payload = await request(`/documents/${id}/verify-password${query ? `?${query}` : ""}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  return {
    payload,
    unlockSession: parseUnlockSessionFromResponse(payload),
  };
}

export async function changeDocumentPassword(id, currentPassword, newPassword) {
  await verifyDocumentPassword(id, currentPassword);
  return protectDocument(id, newPassword);
}

export async function resetDocumentProtectionPassword(id, newPassword) {
  try {
    return await request(`/documents/${id}/protect/reset`, {
      method: "POST",
      body: JSON.stringify({ password: newPassword, newPassword }),
    });
  } catch (error) {
    // Backward-compatible fallback for backends that still use /protect for owner reset.
    if (/request failed \(404\)/i.test(String(error?.message || ""))) {
      return protectDocument(id, newPassword);
    }
    throw error;
  }
}

/**
 * Share-link visitors may not be signed in.
 * Backend: POST /api/documents/{id}/verify-password?token={shareToken}
 */
export async function verifySharedDocumentPassword(shareToken, documentId, password) {
  const encodedId = encodeURIComponent(documentId);
  const params = new URLSearchParams({ token: shareToken });
  const authToken = authService.getToken();

  const response = await fetch(
    buildApiUrl(`/api/documents/${encodedId}/verify-password?${params.toString()}`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ password }),
    },
  );

  const payload = await parseJsonResponse(response);
  return {
    payload: payload?.data ?? payload,
    unlockSession: parseUnlockSessionFromResponse(payload),
  };
}
