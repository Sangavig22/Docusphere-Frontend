import { request } from "../api/apiClient.js";
import { API_BASE_URL } from "../config/api.js";
import { decorateVersionStatuses, resolveChangeSummary } from "../utils/versionUtils.js";

function resolveEditedBy(raw) {
  if (typeof raw?.editedBy === "string" && raw.editedBy.trim()) return raw.editedBy.trim();
  if (typeof raw?.editedByName === "string" && raw.editedByName.trim()) return raw.editedByName.trim();
  if (typeof raw?.createdByName === "string" && raw.createdByName.trim()) return raw.createdByName.trim();
  if (typeof raw?.uploadedByName === "string" && raw.uploadedByName.trim()) return raw.uploadedByName.trim();

  const editedBy = raw?.editedBy ?? raw?.createdBy ?? raw?.uploadedBy;
  if (editedBy && typeof editedBy === "object") {
    const name =
      editedBy.fullName || editedBy.name || editedBy.userName || editedBy.email || editedBy.displayName;
    if (typeof name === "string" && name.trim()) return name.trim();
  }

  return "Unknown";
}

function resolveEditorRole(raw) {
  const role =
    raw?.editorRole ??
    raw?.editedByRole ??
    raw?.userRole ??
    raw?.role ??
    raw?.teamRole ??
    raw?.editedBy?.role ??
    raw?.createdBy?.role ??
    "";
  return String(role || "").trim();
}

export function normalizeDocumentVersion(raw, index = 0) {
  if (!raw) return null;

  const versionNumber =
    Number(raw.versionNumber ?? raw.version ?? raw.number ?? raw.versionNo ?? index + 1) || index + 1;

  const changeSummaryRaw =
    raw.changeSummary ?? raw.summary ?? raw.change_summary ?? raw.versionSummary ?? raw.description ?? "";

  return {
    id: String(raw.id ?? raw.versionId ?? raw._id ?? versionNumber),
    versionNumber,
    editedBy: resolveEditedBy(raw),
    editorRole: resolveEditorRole(raw),
    editedAt: raw.editedAt ?? raw.edited_at ?? raw.createdAt ?? raw.created_at ?? raw.updatedAt ?? null,
    fileSize: Number(raw.fileSize ?? raw.sizeBytes ?? raw.size ?? 0),
    changeSummary: String(changeSummaryRaw || "").trim(),
    isCurrent: Boolean(raw.isCurrent ?? raw.current ?? raw.isActive ?? raw.active),
    isLatest: Boolean(raw.isLatest ?? raw.latest),
    isRestored: Boolean(
      raw.isRestored ?? raw.restored ?? raw.wasRestored ?? String(raw.status || "").toUpperCase() === "RESTORED",
    ),
    isProtected: Boolean(
      raw.isProtected ?? raw.protected ?? raw.passwordProtected ?? raw.isPasswordProtected ?? raw.secured,
    ),
  };
}

function parseVersionsPayload(payload, { page = 1, documentProtected = false } = {}) {
  const root = payload?.data ?? payload;
  const list = Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.versions)
      ? root.versions
      : Array.isArray(root?.content)
        ? root.content
        : Array.isArray(root)
          ? root
          : [];

  const totalItems =
    Number(root?.totalItems ?? root?.totalElements ?? root?.total ?? root?.count ?? list.length) ||
    list.length;
  const zeroBasedPage = Number(root?.page ?? root?.currentPage ?? root?.number ?? page - 1) || 0;
  const pageSize = Number(root?.size ?? root?.pageSize ?? root?.limit ?? list.length) || list.length || 10;
  const totalPages = Number(root?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize))) || 1;
  const currentVersionNumber = Number(
    root?.currentVersionNumber ?? root?.currentVersion ?? root?.latestVersionNumber ?? 0,
  );

  let versions = list.map(normalizeDocumentVersion).filter(Boolean);

  if (currentVersionNumber > 0) {
    versions = versions.map((version) => ({
      ...version,
      isCurrent: version.isCurrent || version.versionNumber === currentVersionNumber,
    }));
  }

  if (versions.length > 0 && !versions.some((version) => version.isCurrent)) {
    const newest = versions.reduce((best, version) =>
      version.versionNumber > best.versionNumber ? version : best,
    );
    newest.isCurrent = true;
  }

  versions = decorateVersionStatuses(versions, { page: zeroBasedPage + 1, documentProtected });

  return {
    versions,
    currentVersionNumber:
      currentVersionNumber ||
      versions.find((version) => version.isCurrent)?.versionNumber ||
      versions[0]?.versionNumber ||
      0,
    pagination: {
      page: zeroBasedPage + 1,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

export async function fetchDocumentVersions(documentId, { page = 1, pageSize = 10, documentProtected = false } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(Math.max(0, page - 1)));
  params.set("size", String(pageSize));

  const payload = await request(`/documents/${encodeURIComponent(documentId)}/versions?${params.toString()}`, {
    method: "GET",
  });

  return parseVersionsPayload(payload, { page, documentProtected });
}

export async function fetchDocumentVersion(documentId, versionId) {
  const payload = await request(
    `/documents/${encodeURIComponent(documentId)}/versions/${encodeURIComponent(versionId)}`,
    { method: "GET" },
  );

  const root = payload?.data ?? payload;
  const version = normalizeDocumentVersion(root?.version ?? root);
  if (!version) return null;

  return {
    ...version,
    changeSummary: resolveChangeSummary(version.changeSummary),
    documentName: root?.documentName ?? root?.name ?? root?.fileName ?? "",
  };
}

export async function downloadDocumentVersion(
  documentId,
  versionId,
  fileName = "document",
  { unlockToken, password } = {},
) {
  const response = await fetch(
    `${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/versions/${encodeURIComponent(versionId)}/download`,
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
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export async function restoreDocumentVersion(documentId, versionId) {
  return request(
    `/documents/${encodeURIComponent(documentId)}/versions/${encodeURIComponent(versionId)}/restore`,
    { method: "POST" },
  );
}

export async function saveDocumentChangeSummary(documentId, changeSummary) {
  const summary = resolveChangeSummary(changeSummary);
  return request(`/documents/${encodeURIComponent(documentId)}/versions/summary`, {
    method: "POST",
    body: JSON.stringify({
      changeSummary: summary,
      summary,
    }),
  });
}

export async function forceSaveDocument(documentId) {
  return request(`/editor/documents/${encodeURIComponent(documentId)}/forcesave`, {
    method: "POST",
  });
}

export async function fetchVersionEditorConfig(documentId, versionId) {
  return request(
    `/editor/documents/${encodeURIComponent(documentId)}/versions/${encodeURIComponent(versionId)}`,
    { method: "GET" },
  );
}
