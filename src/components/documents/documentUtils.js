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
  const t = raw.includes("/") ? raw.split("/").pop() : raw; // handle MIME like image/png
  if (t === "pdf") return "pdf";
  if (t === "doc" || t === "docx" || t === "word") return "word";
  if (t === "xls" || t === "xlsx" || t === "csv" || t === "sheet" || t === "spreadsheet") return "sheet";
  if (t === "png" || t === "jpg" || t === "jpeg" || t === "gif" || t === "webp" || t === "image") return "image";
  return "other";
}

