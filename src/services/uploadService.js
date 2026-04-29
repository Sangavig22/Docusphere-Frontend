import { API_BASE_URL } from "../config/api";
import authService from "./authService";

const INIT_UPLOAD_ENDPOINT = "/documents/init-upload";
const UPLOAD_CHUNK_ENDPOINT = "/documents/upload-chunk";

function buildAuthHeaders(extraHeaders = {}) {
  const token = authService.getToken();
  return {
    //add authorization header
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

function buildUploadUrl(path) {
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

function buildUploadCandidateUrls(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const primary = buildUploadUrl(normalizedPath);
  const urls = [primary];

  // If an absolute API base is configured but unavailable in some environments,
  // fallback to same-origin proxy path to keep uploads working.
  if (/^https?:\/\//i.test(primary)) {
    urls.push(normalizedPath);
  }

  return Array.from(new Set(urls));
}

function extractBackendErrorMessage(parsed) {
  if (!parsed) return "";

  const direct =
    parsed.message ||
    parsed.error ||
    parsed?.data?.message ||
    parsed?.data?.error ||
    "";
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  if (Array.isArray(parsed?.errors) && parsed.errors.length > 0) {
    const first = parsed.errors[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (typeof first?.message === "string" && first.message.trim()) return first.message.trim();
  }

  return "";
}

export const uploadService = {
  async initUpload(file, metadata = {}) {
    let res;
    const token = authService.getToken();
    if (!token) {
      throw new Error("Missing auth token. Please sign in again before uploading.");
    }
    const totalChunks =
      Number(metadata.totalChunks) > 0 ? Number(metadata.totalChunks) : undefined;
    const chunkSize =
      Number(metadata.chunkSize) > 0 ? Number(metadata.chunkSize) : undefined;
    const ownerId = metadata.ownerId ? String(metadata.ownerId) : undefined;
    const teamId = metadata.teamId ? String(metadata.teamId) : undefined;

    const candidateUrls = buildUploadCandidateUrls(`/api${INIT_UPLOAD_ENDPOINT}`);
    let lastNetworkError = "";

    for (const url of candidateUrls) {
      try {
        res = await fetch(url, {
          method: "POST",
          headers: buildAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || undefined,
            ownerId,
            teamId,
            totalChunks,
            chunkSize,
          }),
        });
        break;
      } catch (err) {
        lastNetworkError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!res) {
      throw new Error(
        `Cannot reach upload server. Tried: ${candidateUrls.join(", ")}${lastNetworkError ? ` | ${lastNetworkError}` : ""}`,
      );
    }

    if (!res.ok) {
      let message = "";
      try {
        const parsed = await res.json();
        message = extractBackendErrorMessage(parsed);
      } catch {
        message = (await res.text()).trim();
      }
      const details = `Init upload failed (${res.status}) at ${res.url}`;
      throw new Error(message ? `${message} | ${details}` : details);
    }

    return res.json();
  },

  async uploadChunk(formData) {
    let res;
    const token = authService.getToken();
    if (!token) {
      throw new Error("Missing auth token. Please sign in again before uploading.");
    }
    const candidateUrls = buildUploadCandidateUrls(`/api${UPLOAD_CHUNK_ENDPOINT}`);
    let lastNetworkError = "";

    for (const url of candidateUrls) {
      try {
        res = await fetch(url, {
          method: "POST",
          headers: buildAuthHeaders(),
          body: formData,
        });
        break;
      } catch (err) {
        lastNetworkError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!res) {
      throw new Error(
        `Cannot reach upload server while sending chunks. Tried: ${candidateUrls.join(", ")}${lastNetworkError ? ` | ${lastNetworkError}` : ""}`,
      );
    }

    if (!res.ok) {
      let message = "";
      try {
        const parsed = await res.json();
        message = extractBackendErrorMessage(parsed);
      } catch {
        message = (await res.text()).trim();
      }
      const details = `Chunk upload failed (${res.status}) at ${res.url}`;
      throw new Error(message ? `${message} | ${details}` : details);
    }

    return res.json();
  },
};