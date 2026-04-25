export const DOCUMENTS_PAGE_SIZE = 15;

export const DOCUMENTS_ENDPOINT =
  import.meta.env.VITE_MY_DOCUMENTS_ENDPOINT ?? "/api/my-documents";

export const DEFAULT_DOCUMENTS_SORT = "updated_desc";

export const DOCUMENT_SORT_MAP = {
  name_asc: { sortBy: "name", sortDirection: "ASC" },
  name_desc: { sortBy: "name", sortDirection: "DESC" },
  updated_desc: { sortBy: "updatedAt", sortDirection: "DESC" },
  size_desc: { sortBy: "sizeBytes", sortDirection: "DESC" },
};

export const DOCUMENT_TYPE_FILTER_OPTIONS = [
  { key: "all", label: "All Types" },
  { key: "pdf", label: "PDF" },
  { key: "word", label: "Word" },
  { key: "sheet", label: "Spreadsheet" },
  { key: "powerpoint", label: "PowerPoint" },
  { key: "image", label: "Image" },
];

export const BACKEND_SINGLE_TYPE_FILTERS = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "png",
  "jpg",
  "jpeg",
]);
