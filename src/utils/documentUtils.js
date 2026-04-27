export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  const fixed = i === 0 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(fixed)} ${units[i]}`;
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
    t === "csv" ||
    t === "sheet" ||
    t === "spreadsheet" ||
    rawNoParams.includes("spreadsheetml") ||
    rawNoParams.includes("ms-excel") ||
    rawNoParams.includes("excel")
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
  const normalizedFromType = normalizeDocumentType(docType);
  if (normalizedFromType === filterType) return true;

  const extensionFromName = extractExtension(docName);
  if (extensionFromName && normalizeDocumentType(extensionFromName) === filterType) return true;

  const extensionFromType = extractExtension(docType);
  if (extensionFromType && normalizeDocumentType(extensionFromType) === filterType) return true;

  return false;
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
