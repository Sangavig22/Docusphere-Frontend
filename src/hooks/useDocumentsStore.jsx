import { useContext } from "react";

import { DocumentsStoreContext } from "./documentsStoreContext";

export function useDocumentsStore() {
  const context = useContext(DocumentsStoreContext);
  if (!context) {
    throw new Error("useDocumentsStore must be used within a DocumentsProvider");
  }
  return context;
}
