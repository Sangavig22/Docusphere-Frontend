import { createContext, useContext, useMemo, useState } from "react";

const DocumentsStoreContext = createContext(null);

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);

  const value = useMemo(
    () => ({
      documents,
      addDocuments: (nextDocuments) => {
        if (Array.isArray(nextDocuments)) {
          setDocuments((previous) => [...previous, ...nextDocuments]);
          return;
        }
        if (nextDocuments) {
          setDocuments((previous) => [...previous, nextDocuments]);
        }
      },
      clearDocuments: () => setDocuments([]),
    }),
    [documents]
  );

  return <DocumentsStoreContext.Provider value={value}>{children}</DocumentsStoreContext.Provider>;
}

export function useDocumentsStore() {
  const context = useContext(DocumentsStoreContext);
  if (!context) {
    throw new Error("useDocumentsStore must be used within a DocumentsProvider");
  }
  return context;
}
