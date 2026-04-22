import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "docusphere.documents.v1";

const DocumentsContext = createContext(null);

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function readInitialDocuments() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;
  return Array.isArray(parsed) ? parsed : [];
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `doc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function fileToDoc(file) {
  const name = file?.name ?? "Untitled";
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  return {
    id: createId(),
    name,
    type: ext || (file?.type ?? "other"),
    sizeBytes: Number(file?.size ?? 0),
    updatedAt: new Date().toISOString(),
    category: "",
    starred: false,
  };
}

function normalizeIncomingDoc(input) {
  if (!input) return null;
  if (typeof File !== "undefined" && input instanceof File) return fileToDoc(input);

  const d = input;
  const id = d.id || createId();
  const name = d.name || "Untitled";
  const type = d.type || (name.includes(".") ? name.split(".").pop().toLowerCase() : "other");
  const sizeBytes = Number(d.sizeBytes ?? d.size ?? 0);
  const updatedAt = d.updatedAt ?? d.updated_at ?? new Date().toISOString();
  const category = d.category ?? d.folder ?? "";
  const starred = Boolean(d.starred);

  return { id, name, type, sizeBytes, updatedAt, category, starred };
}

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState(readInitialDocuments);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const addDocuments = useCallback((filesOrDocs) => {
    const arr = Array.isArray(filesOrDocs) ? filesOrDocs : filesOrDocs ? [filesOrDocs] : [];
    const incoming = arr.map(normalizeIncomingDoc).filter(Boolean);

    if (incoming.length === 0) return [];

    setDocuments((prev) => {
      const byId = new Map(prev.map((d) => [d.id, d]));
      for (const d of incoming) {
        byId.set(d.id, { ...byId.get(d.id), ...d });
      }
      return Array.from(byId.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    });

    return incoming;
  }, []);

  const removeDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateDocument = useCallback((id, patch) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const toggleStar = useCallback((id) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d)),
    );
  }, []);

  const value = useMemo(
    () => ({ documents, addDocuments, removeDocument, updateDocument, toggleStar }),
    [documents, addDocuments, removeDocument, updateDocument, toggleStar],
  );

  return createElement(DocumentsContext.Provider, { value }, children);
}

export function useDocumentsStore() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) {
    throw new Error("useDocumentsStore must be used within <DocumentsProvider>.");
  }
  return ctx;
}

// Export context for direct context usage
export { DocumentsContext };

