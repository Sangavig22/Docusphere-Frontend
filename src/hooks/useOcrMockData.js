import { useState, useCallback } from "react";

/**
 * Hook to manage OCR document mock data and state
 */
export function useOcrMockData() {
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

  const correctOutput = useCallback((file) => {
    if (!file) return;
    
    setDocumentData({
      title: file.name,
      description: "AI-generated summary based on the extracted contents.",
      tags: ["OCR", "AI", "Document"],
      keyPoints: [
        "Extracted high-fidelity text for analysis.",
        "Identified critical clauses and action items.",
        "Automatically categorized by AI semantics.",
      ],
      summary: `The document "${file.name}" has been fully analyzed. The AI extracted comprehensive text and identified core themes regarding its content. This summary was generated after a deep scan of the ${file.size > 1000000 ? 'large' : 'provided'} file to ensure all key points were captured accurately.`
    });
  }, []);

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
    correctOutput,
    updateDocumentData,
    resetDocumentData,
    setDocumentResults
  };
}
