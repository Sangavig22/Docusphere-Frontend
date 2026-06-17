import { useState, useEffect } from "react";
import UploadCard from "../components/upload/UploadCard";
import UploadDropzone from "../components/upload/UploadDropzone";
import SuccessBanner from "../components/ocr/SuccessBanner";
import ResultCards from "../components/ocr/ResultCards";
import ProcessingStateCard from "../components/ocr/ProcessingStateCard";
import RegenerateToast from "../components/ocr/RegenerateToast";
import DeleteConfirmModal from "../components/ocr/DeleteConfirmModal";
import EditDocumentModal from "../components/ocr/EditDocumentModal";
import ErrorStateCard from "../components/ocr/ErrorStateCard";
import { useOcrMockData } from "../hooks/useOcrMockData";
import { ocrService } from "../services/ocrService";
import { uploadConfig } from "../config/uploadConfig";

/**
 * OcrProcessingView — shows step-by-step progress during OCR/AI analysis.
 */
function OcrProcessingView({ filename, onCancel }) {
  const [activeStep, setActiveStep] = useState(1);
  const steps = ["Uploading", "Extracting Text", "AI Summarizing"];

  useEffect(() => {
    const handleProgress = (e) => {
      if (e.detail.step) setActiveStep(e.detail.step);
    };
    window.addEventListener("ocr-progress", handleProgress);
    return () => window.removeEventListener("ocr-progress", handleProgress);
  }, []);

  return (
    <ProcessingStateCard
      fileName={filename}
      steps={steps}
      activeStep={activeStep}
      onCancel={onCancel}
    />
  );
}

/**
 * Main OCR Summarization Page Component.
 *
 * Uses UploadDropzone (UI-only) directly so that file selection triggers
 * the OCR pipeline immediately — bypassing the shared My Documents upload
 * service entirely. No document record is created in My Documents.
 */
export default function OCRSummarization() {
  const [status, setStatus] = useState("idle"); // idle | processing | regenerating | success | error
  const [errorHeader, setErrorHeader] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRegenerateToast, setShowRegenerateToast] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    documentData,
    updateDocumentData,
    resetDocumentData,
    setDocumentResults,
  } = useOcrMockData();

  const MAX_FILE_SIZE = 50_000_000; // 50 MB

  // ─── OCR Upload Pipeline ──────────────────────────────────────────────────
  // Sends file directly to /api/ocr/upload — no My Documents upload involved.
  const runOcrPipeline = async (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorHeader(
        `Upload failed. The file "${file.name}" exceeds the 50 MB size limit for OCR processing.`
      );
      setStatus("error");
      return;
    }

    setSelectedFile(file);
    setStatus("processing");

    try {
      // 1. Send file directly to OCR endpoint (returns a jobId)
      const { jobId } = await ocrService.uploadDocument(file);

      // 2. Poll for job completion
      let isDone = false;
      while (!isDone) {
        const jobStatus = await ocrService.checkStatus(jobId);

        if (jobStatus.status === "COMPLETED") {
          // Mark final step as done in the stepper UI
          window.dispatchEvent(
            new CustomEvent("ocr-progress", { detail: { step: 4 } })
          );
          // Brief pause so user sees the last green checkmark
          await new Promise((r) => setTimeout(r, 1000));

          setDocumentResults(jobStatus.result);
          setStatus("success");
          isDone = true;
        } else if (jobStatus.status === "FAILED") {
          throw new Error(jobStatus.error || "Processing failed");
        } else {
          // Map backend states → stepper steps
          let step = 1;
          if (jobStatus.status === "EXTRACTING") step = 2;
          if (jobStatus.status === "SUMMARIZING") step = 3;
          window.dispatchEvent(
            new CustomEvent("ocr-progress", { detail: { step } })
          );
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setErrorHeader(err.message || "The document could not be processed");
      setStatus("error");
    }
  };

  // Called when user selects a file from the dropzone (idle state)
  const handleFileSelected = (file) => {
    runOcrPipeline(file);
  };

  // ─── Regenerate ───────────────────────────────────────────────────────────
  const handleRegenerate = async () => {
    if (!selectedFile) return;
    setStatus("regenerating");

    try {
      const { jobId } = await ocrService.uploadDocument(selectedFile);

      let isDone = false;
      while (!isDone) {
        const jobStatus = await ocrService.checkStatus(jobId);
        if (jobStatus.status === "COMPLETED") {
          setDocumentResults(jobStatus.result);
          setStatus("success");
          setShowRegenerateToast(true);
          setTimeout(() => setShowRegenerateToast(false), 3000);
          isDone = true;
        } else if (jobStatus.status === "FAILED") {
          throw new Error(jobStatus.error || "Regeneration failed");
        } else {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    } catch (err) {
      console.error("Regenerate Error:", err);
      setErrorHeader(err.message || "Regeneration failed. Please try again.");
      setStatus("error");
    }
  };

  const onSaveEdit = (newData) => {
    updateDocumentData(newData);
    setShowEditModal(false);
  };

  const resetAll = () => {
    setStatus("idle");
    setSelectedFile(null);
    setShowDeleteModal(false);
    resetDocumentData();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">

      {/* IDLE — file picker (UI-only dropzone, no My Documents upload) */}
      {status === "idle" && (
        <UploadCard
          title="OCR Summarization"
          subtitle="Upload an image or PDF to extract text and generate a summary."
        >
          <UploadDropzone
            onFileSelected={handleFileSelected}
            accept={uploadConfig.ocrFormats}
            variant="ocr"
          />
        </UploadCard>
      )}

      {/* PROCESSING — step-by-step OCR progress */}
      {status === "processing" && (
        <UploadCard title="OCR Summarization" subtitle="Analyzing your document...">
          <OcrProcessingView
            filename={selectedFile?.name || "Document"}
            onCancel={resetAll}
          />
        </UploadCard>
      )}

      {/* REGENERATING — spinner while re-processing */}
      {status === "regenerating" && (
        <UploadCard
          title="OCR Summarization"
          subtitle={`Re-processing ${selectedFile?.name}...`}
        >
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-gray-500">
              Re-running OCR and AI analysis, please wait...
            </p>
          </div>
        </UploadCard>
      )}

      {/* ERROR */}
      {status === "error" && (
        <UploadCard
          title="OCR Summarization"
          subtitle="The document could not be processed"
        >
          <ErrorStateCard
            message={
              errorHeader ||
              "Upload failed. The file is corrupted or exceeds the size limit."
            }
            onTryAgain={resetAll}
          />
        </UploadCard>
      )}

      {/* SUCCESS — results visible only in-session, not saved to DB */}
      {status === "success" && (
        <UploadCard
          title="OCR Summarization Result"
          subtitle={`Processed ${selectedFile?.name}`}
        >
          <div className="space-y-6">
            <SuccessBanner fileName={selectedFile?.name || "Document"} />
            <ResultCards
              document={documentData}
              onRegenerate={handleRegenerate}
              onEdit={() => setShowEditModal(true)}
              onDelete={() => setShowDeleteModal(true)}
            />
          </div>
        </UploadCard>
      )}

      {/* Overlays & Modals */}
      <RegenerateToast
        show={showRegenerateToast}
        onClose={() => setShowRegenerateToast(false)}
      />

      <EditDocumentModal
        open={showEditModal}
        document={documentData}
        onCancel={() => setShowEditModal(false)}
        onSave={onSaveEdit}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        fileName={selectedFile?.name}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={resetAll}
      />
    </div>
  );
}
