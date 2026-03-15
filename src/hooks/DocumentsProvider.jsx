import { useMemo, useState } from "react";

import { DocumentsStoreContext } from "./documentsStoreContext";

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
