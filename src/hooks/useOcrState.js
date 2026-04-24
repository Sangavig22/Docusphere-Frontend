import { useState, useCallback } from "react";

/**
 * Hook to manage OCR document state and results
 */
export function useOcrState() {
  const [documentData, setDocumentData] = useState({
    title: "",
    description: "AI-generated summary based on the extracted contents.",
    tags: ["OCR", "AI", "Document"],
    keyPoints: [
      "Extracted high-fidelity text for analysis.",
      "Identified critical clauses and action items.",
      "Automatically categorized by AI semantics.",
    ],
    summary: "The AI is processing your document to generate a relevant summary...",
  });

  const updateDocumentData = useCallback((newData) => {
    setDocumentData((prev) => ({ ...prev, ...newData }));
  }, []);

  const resetDocumentData = useCallback(() => {
    setDocumentData({
      title: "",
      description: "AI-generated summary based on the extracted contents.",
      tags: ["OCR", "AI", "Document"],
      keyPoints: [
        "Extracted high-fidelity text for analysis.",
        "Identified critical clauses and action items.",
        "Automatically categorized by AI semantics.",
      ],
      summary: "The AI is processing your document to generate a relevant summary...",
    });
  }, []);

  const setDocumentResults = useCallback((data) => {
    setDocumentData(data);
  }, []);

  return {
    documentData,
    updateDocumentData,
    resetDocumentData,
    setDocumentResults
  };
}
