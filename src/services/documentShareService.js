import { API_BASE_URL } from "../config/api";
import { ShareAccessError } from "../utils/shareAccessErrors";

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

function parseContentDispositionFilename(header) {
  if (!header) return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }
  const match = header.match(/filename="?([^";\n]+)"?/i);
  return match ? match[1].trim() : null;
}

async function parseShareResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new ShareAccessError(message, { status: response.status });
  }

  return data?.data ?? data;
}

function normalizeEditorConfig(config, { token } = {}) {
  if (!config || typeof config !== "object") return config;

  if (config.config && typeof config.config === "object") {
    return normalizeEditorConfig(config.config, { token });
  }

  const result = { ...config };

  if (result.document && typeof result.document === "object") {
    result.document = { ...result.document };
    if (result.document.url && token) {
      result.document.url = appendShareTokenToUrl(result.document.url, token);
    }
  }

  if (result.editorConfig && typeof result.editorConfig === "object") {
    result.editorConfig = {
      ...result.editorConfig,
      mode: result.editorConfig.mode || "edit",
      customization: {
        ...(result.editorConfig.customization || {}),
        comments: false,
        chat: false,
      },
    };
    if (result.editorConfig.callbackUrl && token) {
      result.editorConfig.callbackUrl = appendShareTokenToUrl(
        result.editorConfig.callbackUrl,
        token,
      );
    }
  }

  return result;
}

function appendShareTokenToUrl(url, token) {
  if (!url || !token || String(url).includes("token=")) return url;

  try {
    const absolute = /^https?:\/\//i.test(url)
      ? url
      : `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
    const parsed = new URL(absolute);
    if (!parsed.searchParams.has("token")) {
      parsed.searchParams.set("token", token);
    }
    return parsed.toString();
  } catch {
    const separator = String(url).includes("?") ? "&" : "?";
    return `${url}${separator}token=${encodeURIComponent(token)}`;
  }
}

async function fetchEditorConfigFromPath(path) {
  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return parseShareResponse(response);
}

async function fetchShareEditorConfigRaw(path) {
  const response = await fetch(buildApiUrl(path), {
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
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new ShareAccessError(message, { status: response.status });
  }

  return data;
}

function shouldStopRetrying(error) {
  const status = Number(error?.status) || 0;
  return status === 403 || status === 410 || status === 401;
}

export async function getSharedDocumentByToken(token) {
  const response = await fetch(buildApiUrl(`/api/share/${encodeURIComponent(token)}`), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  return parseShareResponse(response);
}

export async function getSharedEditorConfig(token, documentId) {
  const encodedToken = encodeURIComponent(token);
  let lastError = null;

  try {
    const data = await fetchShareEditorConfigRaw(`/api/share/${encodedToken}/editor-config`);
    const config = data?.config ?? data?.data?.config;
    if (config && typeof config === "object") {
      return normalizeEditorConfig(config, { token });
    }
  } catch (error) {
    lastError = error;
    if (shouldStopRetrying(error)) throw error;
  }

  if (!documentId) {
    throw lastError || new ShareAccessError("Document id is missing in share response.", { status: 400 });
  }

  const encodedId = encodeURIComponent(documentId);
  const config = await fetchEditorConfigFromPath(
    `/api/editor/documents/${encodedId}?token=${encodedToken}`,
  );

  return normalizeEditorConfig(config, { token });
}

async function fetchShareCommentsFromPath(path) {
  const response = await fetch(buildApiUrl(path), {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return parseShareResponse(response);
}

export async function getSharedComments(token, documentId) {
  const encodedToken = encodeURIComponent(token);
  const paths = [`/api/share/${encodedToken}/comments`];

  if (documentId) {
    const encodedId = encodeURIComponent(documentId);
    paths.push(`/api/comments/${encodedId}?token=${encodedToken}`);
  }

  let lastError = null;
  for (const path of paths) {
    try {
      const data = await fetchShareCommentsFromPath(path);
      return Array.isArray(data) ? data : data?.comments || [];
    } catch (error) {
      lastError = error;
      if (shouldStopRetrying(error)) throw error;
    }
  }

  throw lastError || new ShareAccessError("Comments unavailable", { status: 404 });
}

export async function addSharedComment(token, documentId, message) {
  const encodedToken = encodeURIComponent(token);
  const trimmed = String(message || "").trim();
  const attempts = [
    {
      path: `/api/share/${encodedToken}/comments`,
      body: { message: trimmed },
    },
  ];

  if (documentId) {
    const encodedId = encodeURIComponent(documentId);
    attempts.push({
      path: `/api/comments?token=${encodedToken}`,
      body: { documentId, message: trimmed },
    });
    attempts.push({
      path: `/api/comments/${encodedId}?token=${encodedToken}`,
      body: { message: trimmed },
    });
  }

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const response = await fetch(buildApiUrl(attempt.path), {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attempt.body),
      });
      return parseShareResponse(response);
    } catch (error) {
      lastError = error;
      if (shouldStopRetrying(error)) throw error;
    }
  }

  throw lastError || new ShareAccessError("Unable to post comment", { status: 400 });
}

export async function downloadSharedDocument(
  documentId,
  token,
  { password, fileName, mimeType } = {},
) {
  const params = new URLSearchParams({ token });
  if (password) params.set("password", password);

  const response = await fetch(
    buildApiUrl(`/api/documents/${encodeURIComponent(documentId)}/download?${params.toString()}`),
    {
      method: "GET",
      credentials: "include",
      headers: password ? { "X-Document-Password": password } : {},
    },
  );

  if (!response.ok) {
    throw new ShareAccessError(`Download failed (${response.status})`, {
      status: response.status,
    });
  }

  const headerName = parseContentDispositionFilename(response.headers.get("Content-Disposition"));
  const downloadName = headerName || fileName || "document";
  const responseBlob = await response.blob();
  const blob =
    mimeType && responseBlob.type !== mimeType
      ? new Blob([responseBlob], { type: mimeType })
      : responseBlob;

  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = downloadName;
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);
}
