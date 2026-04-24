import {
  BACKEND_SINGLE_TYPE_FILTERS,
  DOCUMENTS_ENDPOINT,
  DOCUMENTS_PAGE_SIZE,
  DOCUMENT_SORT_MAP,
} from "../constants/documents";
import { API_BASE_URL } from "../config/api";
import authService from "./authService";
import { getUserIdFromToken } from "../utils/authToken";

const CURRENT_USER_STORAGE_KEY = "currentUser";

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildApiUrl(pathWithOptionalQuery) {
  const path = pathWithOptionalQuery.startsWith("/") ? pathWithOptionalQuery : `/${pathWithOptionalQuery}`;
  const base = (API_BASE_URL || "").trim();
  const baseIsAbsolute = /^https?:\/\//i.test(base);

  if (baseIsAbsolute) {
    const baseNoSlash = base.replace(/\/+$/, "");
    const pathForBase =
      baseNoSlash.endsWith("/api") && path.startsWith("/api/") ? path.slice(4) : path;
    return `${baseNoSlash}${pathForBase}`;
  }

  if (base === "/api" && path.startsWith("/api/")) {
    return path;
  }

  return `${base}${path}`;
}

function normalizeDoc(raw) {
  if (!raw) return null;

  return {
    id: raw.id ?? raw._id ?? raw.documentId,
    name: raw.name ?? raw.fileName ?? "Untitled",
    type: raw.type ?? raw.mimeType ?? raw.extension ?? "other",
    sizeBytes: Number(raw.sizeBytes ?? raw.size ?? raw.fileSize ?? 0),
    updatedAt: raw.updatedAt ?? raw.updated_at ?? raw.modifiedAt ?? new Date().toISOString(),
    category: raw.category ?? raw.folder ?? "",
    starred: Boolean(raw.starred),
  };
}

function parseListPayload(payload) {
  const root = payload?.data ?? payload;
  const list = Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.documents)
      ? root.documents
      : Array.isArray(root?.content)
        ? root.content
        : Array.isArray(root)
          ? root
          : [];

  const totalItems =
    Number(root?.totalItems ?? root?.totalElements ?? root?.total ?? root?.count ?? list.length) ||
    list.length;
  const zeroBasedPage =
    Number(root?.page ?? root?.currentPage ?? root?.number ?? root?.pageNumber ?? 0) || 0;
  const pageSize =
    Number(root?.size ?? root?.pageSize ?? root?.limit ?? DOCUMENTS_PAGE_SIZE) || DOCUMENTS_PAGE_SIZE;
  const totalPages =
    Number(root?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize))) || 1;
  const page = zeroBasedPage + 1;

  return {
    documents: list.map(normalizeDoc).filter(Boolean),
    pagination: { page, pageSize, totalItems, totalPages },
  };
}

function getNumericUserIdForStar() {
  if (typeof window === "undefined") return "";

  const fromLocalStorage = (window.localStorage.getItem("userId") || "").trim();
  if (/^\d+$/.test(fromLocalStorage)) return fromLocalStorage;

  const fromSessionStorage = (window.sessionStorage.getItem("userId") || "").trim();
  if (/^\d+$/.test(fromSessionStorage)) return fromSessionStorage;

  const currentUserRaw =
    window.localStorage.getItem(CURRENT_USER_STORAGE_KEY) ||
    window.sessionStorage.getItem(CURRENT_USER_STORAGE_KEY) ||
    "";
  const currentUser = currentUserRaw ? safeJsonParse(currentUserRaw) : null;
  const fromCurrentUser = String(currentUser?.userId ?? currentUser?.id ?? "").trim();
  if (/^\d+$/.test(fromCurrentUser)) return fromCurrentUser;

  const token = authService.getToken();
  const fromToken = String(getUserIdFromToken(token) || "").trim();
  if (/^\d+$/.test(fromToken)) return fromToken;

  return "";
}

async function readErrorMessage(response, fallbackMessage) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await response.json();
      return json?.message || json?.error || fallbackMessage;
    }
    const text = (await response.text()).trim();
    return text || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function parseMutationResponse(response) {
  if (response.status === 204) return { success: true };

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return { success: true };

  return response.json();
}

export async function fetchMyDocuments({
  page = 1,
  pageSize = DOCUMENTS_PAGE_SIZE,
  query = "",
  filterType = "all",
  sortKey = "updated_desc",
  starred,
  recentDays,
  scope,
  signal,
} = {}) {
  const token = authService.getToken();
  if (!token) throw new Error("Please sign in to view documents.");

  const sort = DOCUMENT_SORT_MAP[sortKey] ?? DOCUMENT_SORT_MAP.updated_desc;
  const params = new URLSearchParams();
  params.set("page", String(Math.max(0, page - 1)));
  params.set("size", String(pageSize));
  params.set("sortBy", sort.sortBy);
  params.set("sortDirection", sort.sortDirection);

  if (query?.trim()) params.set("search", query.trim());
  // Backend supports one concrete extension in `type`; grouped filters are applied in UI.
  if (filterType && filterType !== "all" && BACKEND_SINGLE_TYPE_FILTERS.has(filterType)) {
    params.set("type", filterType);
  }
  if (typeof starred === "boolean") params.set("starred", String(starred));

  // Backend currently validates these directly. Include only when explicitly set.
  if (scope && scope !== "all") params.set("scope", scope);
  if (Number.isFinite(Number(recentDays)) && Number(recentDays) > 0) {
    params.set("recentDays", String(Number(recentDays)));
  }

  const endpoint = DOCUMENTS_ENDPOINT.startsWith("/") ? DOCUMENTS_ENDPOINT : `/${DOCUMENTS_ENDPOINT}`;
  const url = buildApiUrl(`${endpoint}?${params.toString()}`);
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      `Failed to load documents (HTTP ${response.status})`,
    );
    throw new Error(message);
  }

  const payload = await response.json();
  return parseListPayload(payload);
}

export async function starDocument(documentId, { userId } = {}) {
  const token = authService.getToken();
  if (!token) throw new Error("Please sign in again.");

  const provided = String(userId || "").trim();
  const resolvedUserId = /^\d+$/.test(provided) ? provided : getNumericUserIdForStar();
  if (!resolvedUserId) {
    throw new Error("Missing numeric userId for star API. Please sign in again.");
  }

  const url = buildApiUrl(
    `/api/documents/${encodeURIComponent(documentId)}/star?userId=${encodeURIComponent(resolvedUserId)}`,
  );
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      `Failed to star document (HTTP ${response.status})`,
    );
    throw new Error(message);
  }

  return parseMutationResponse(response);
}

export async function unstarDocument(documentId, { userId } = {}) {
  const token = authService.getToken();
  if (!token) throw new Error("Please sign in again.");

  const provided = String(userId || "").trim();
  const resolvedUserId = /^\d+$/.test(provided) ? provided : getNumericUserIdForStar();
  if (!resolvedUserId) {
    throw new Error("Missing numeric userId for unstar API. Please sign in again.");
  }

  const url = buildApiUrl(
    `/api/documents/${encodeURIComponent(documentId)}/star?userId=${encodeURIComponent(resolvedUserId)}`,
  );
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await readErrorMessage(
      response,
      `Failed to unstar document (HTTP ${response.status})`,
    );
    throw new Error(message);
  }

  return parseMutationResponse(response);
}
