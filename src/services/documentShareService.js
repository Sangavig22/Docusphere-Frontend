import { API_BASE_URL } from "../config/api";

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = (API_BASE_URL || "").trim();
  const baseIsAbsolute = /^https?:\/\//i.test(base);

  if (baseIsAbsolute) {
    const baseNoSlash = base.replace(/\/+$/, "");
    const pathForBase =
      baseNoSlash.endsWith("/api") && normalizedPath.startsWith("/api/")
        ? normalizedPath.slice(4)
        : normalizedPath;
    return `${baseNoSlash}${pathForBase}`;
  }

  if (base === "/api" && normalizedPath.startsWith("/api/")) {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`;
}

export async function getSharedDocumentByToken(token) {
  const response = await fetch(buildApiUrl(`/api/share/${encodeURIComponent(token)}`), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }

  // Backend commonly wraps payload in ApiResponse { data, message, ... }.
  return data?.data ?? data;
}

export async function downloadSharedDocument(documentId, token, { password } = {}) {
  const params = new URLSearchParams({
    token,
  });
  if (password) params.set("password", password);

  const response = await fetch(
    buildApiUrl(`/api/documents/${encodeURIComponent(documentId)}/download?${params.toString()}`),
    {
      method: "GET",
      headers: password ? { "X-Document-Password": password } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "shared-document";
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);
}
