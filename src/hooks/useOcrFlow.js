import { useEffect, useRef, useState } from "react";
import {
  buildMockResult,
  OCR_STEPS,
  regenerateSummaryMock,
  simulateProcessing,
  simulateUpload,
} from "../services/ocr/ocrMockService";

const VALID_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
]);

function getFileExtension(fileName = "") {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index).toLowerCase() : "";
}

export default function useOcrFlow() {
  const [status, setStatus] = useState("idle");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toast, setToast] = useState({ open: false, title: "", subtitle: "" });

  const runIdRef = useRef(0);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  function resetToIdle() {
    runIdRef.current += 1;
    setStatus("idle");
    setUploadPercent(0);
    setProcessingStep(0);
    setSelectedFile(null);
    setErrorMessage("");
    setResult(null);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setIsRegenerating(false);
  }

  function validateFile(file) {
    if (!file) return "Please select a file.";
    if (file.size > 10 * 1024 * 1024) {
      return "Upload failed. The file exceeds the 10MB size limit.";
    }
    if (!VALID_EXTENSIONS.has(getFileExtension(file.name))) {
      return "Upload failed. Unsupported file format.";
    }
    return "";
  }

  async function startUpload(file) {
    const validationError = validateFile(file);
    setSelectedFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    const currentRun = runIdRef.current + 1;
    runIdRef.current = currentRun;

    setStatus("uploading");
    setErrorMessage("");
    setUploadPercent(0);
    setProcessingStep(0);

    try {
      await simulateUpload({
        onProgress: setUploadPercent,
        isCancelled: () => runIdRef.current !== currentRun,
      });

      if (runIdRef.current !== currentRun) return;

      setStatus("processing");
      await simulateProcessing({
        onStepChange: setProcessingStep,
        isCancelled: () => runIdRef.current !== currentRun,
      });

      if (runIdRef.current !== currentRun) return;

      setResult(buildMockResult(file));
      setStatus("success");
    } catch (error) {
      if (runIdRef.current !== currentRun) return;
      const message = error?.message || "";
      if (message === "UPLOAD_CANCELLED" || message === "PROCESS_CANCELLED") {
        return;
      }
      setErrorMessage("Upload failed. Please try again.");
      setStatus("error");
    }
  }

  function cancelUpload() {
    resetToIdle();
  }

  function retryFromError() {
    resetToIdle();
  }

  async function regenerateSummary() {
    if (!result) return;
    setIsRegenerating(true);
    setToast({
      open: true,
      title: "Regenerating summary...",
      subtitle: "AI is creating a new summary...",
    });

    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((previous) => ({ ...previous, open: false }));
    }, 2000);

    const nextSummary = await regenerateSummaryMock();
    setResult((previous) => (previous ? { ...previous, summary: nextSummary } : previous));
    setIsRegenerating(false);
  }

  function openEditModal() {
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
  }

  function saveEdits(updatedValues) {
    setResult((previous) => {
      if (!previous) return previous;
      const nextTags = Array.isArray(updatedValues.tags)
        ? updatedValues.tags
        : String(updatedValues.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
      return { ...previous, ...updatedValues, tags: nextTags };
    });
    setEditModalOpen(false);
  }

  function openDeleteModal() {
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
  }

  function confirmDelete() {
    setDeleteModalOpen(false);
    resetToIdle();
  }

  function closeToast() {
    setToast((previous) => ({ ...previous, open: false }));
  }

  return {
    status,
    uploadPercent,
    processingStep,
    selectedFile,
    errorMessage,
    result,
    editModalOpen,
    deleteModalOpen,
    isRegenerating,
    toast,
    steps: OCR_STEPS,
    startUpload,
    cancelUpload,
    retryFromError,
    regenerateSummary,
    openEditModal,
    closeEditModal,
    saveEdits,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    closeToast,
    resetToIdle,
  };
}
