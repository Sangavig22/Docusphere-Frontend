export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  const fixed = i === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(fixed)} ${units[i]}`;
}

export function formatVersionDateTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelativeTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const sec = Math.max(1, Math.floor(diffMs / 1000));
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 7) return `${day}d ago`;
  if (week < 5) return `${week}w ago`;
  if (month < 12) return `${month}mo ago`;
  return `${year}y ago`;
}

export function normalizeDocumentType(type) {
  const raw = (type ?? "").toString().trim().toLowerCase();
  const rawNoParams = raw.split(";")[0].trim();
  const subtypeOrType = rawNoParams.includes("/") ? rawNoParams.split("/").pop() : rawNoParams;
  const t = subtypeOrType.split("+")[0].replace(/^\.+/, "");

  if (t === "pdf" || rawNoParams.includes("pdf")) return "pdf";

  if (
    t === "doc" ||
    t === "docx" ||
    t === "word" ||
    rawNoParams.includes("wordprocessingml") ||
    rawNoParams.includes("msword")
  ) {
    return "word";
  }

  if (
    t === "xls" ||
    t === "xlsx" ||
    t === "xlsm" ||
    t === "xlsb" ||
    t === "csv" ||
    t === "ods" ||
    t === "sheet" ||
    t === "spreadsheet" ||
    t === "excel" ||
    rawNoParams.includes("spreadsheetml") ||
    rawNoParams.includes("ms-excel") ||
    rawNoParams.includes("excel") ||
    rawNoParams.includes("opendocument.spreadsheet")
  ) {
    return "sheet";
  }

  if (
    t === "ppt" ||
    t === "pptx" ||
    t === "powerpoint" ||
    t === "presentation" ||
    rawNoParams.includes("presentationml") ||
    rawNoParams.includes("ms-powerpoint")
  ) {
    return "powerpoint";
  }

  if (
    t === "png" ||
    t === "jpg" ||
    t === "jpeg" ||
    t === "gif" ||
    t === "webp" ||
    t === "image" ||
    rawNoParams.startsWith("image/")
  ) {
    return "image";
  }

  // Handle values like "report.xlsx" stored in the type field.
  if (raw.includes(".")) {
    const extension = raw.split(".").pop()?.replace(/^\.+/, "") || "";
    if (extension && extension !== t) {
      const fromExtension = normalizeDocumentType(extension);
      if (fromExtension !== "other") return fromExtension;
    }
  }

  return "other";
}

function extractExtension(value) {
  const raw = (value ?? "").toString().trim().toLowerCase();
  if (!raw) return "";
  if (raw.includes("/")) {
    const subtype = raw.split("/").pop()?.split(";")[0]?.split("+")[0] || "";
    return subtype.replace(/^\.+/, "");
  }
  if (raw.includes(".")) {
    return raw.split(".").pop()?.replace(/^\.+/, "") || "";
  }
  return raw.replace(/^\.+/, "");
}

export function matchesDocumentFilter(docType, filterType, docName = "") {
  if (!filterType || filterType === "all") return true;

  const candidates = [docType, docName, extractExtension(docName), extractExtension(docType)].filter(Boolean);

  return candidates.some((candidate) => normalizeDocumentType(candidate) === filterType);
}

export function resolveDocumentType(raw = {}, fallbackName = "") {
  const name = fallbackName || raw?.name || raw?.fileName || "";
  const candidates = [
    raw?.extension,
    raw?.fileExtension,
    raw?.mimeType,
    raw?.contentType,
    raw?.fileType,
    raw?.type,
    name,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeDocumentType(candidate);
    if (normalized !== "other") return normalized;
  }

  return normalizeDocumentType(name);
}
export function formatDocumentFormat(type, name) {
  const rawName = (name ?? "").toString().trim();
  const extensionFromName = rawName.includes(".") ? rawName.split(".").pop()?.toLowerCase() : "";
  const rawType = (type ?? "").toString().trim().toLowerCase();
  const extensionFromType = rawType.includes("/") ? rawType.split("/").pop() : rawType;
  const resolvedExtension = extensionFromName || extensionFromType;

  if (resolvedExtension) return resolvedExtension.toUpperCase();

  const normalized = normalizeDocumentType(type);
  if (normalized === "word") return "DOC";
  if (normalized === "sheet") return "XLS";
  if (normalized === "powerpoint") return "PPT";
  if (normalized === "image") return "IMG";
  if (normalized === "pdf") return "PDF";
  return "FILE";
}
