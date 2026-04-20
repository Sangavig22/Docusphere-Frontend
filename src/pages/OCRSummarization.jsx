import { useState, useEffect } from "react";
import DocumentUploadSection from "../components/upload/DocumentUploadSection";
import UploadCard from "../components/upload/UploadCard";
import SuccessBanner from "../components/ocr/SuccessBanner";
import ResultCards from "../components/ocr/ResultCards";
import ProcessingStateCard from "../components/ocr/ProcessingStateCard";
import RegenerateToast from "../components/ocr/RegenerateToast";
import EditDocumentModal from "../components/ocr/EditDocumentModal";
import DeleteConfirmModal from "../components/ocr/DeleteConfirmModal";
import ErrorStateCard from "../components/ocr/ErrorStateCard";
import { useOcrMockData } from "../hooks/useOcrMockData";

/**
 * OcrProcessingView is defined here to provide the "Upload Process Section"
 * logic required by the reused DocumentUploadSection component.
 */
function OcrProcessingView({ filename, onCancel }) {
  const [activeStep, setActiveStep] = useState(1);
  const steps = ["Uploading", "Extracting Text", "AI Summarizing"];

  useEffect(() => {
    // Stage 1 transition
    const stepTimer = setTimeout(() => setActiveStep(2), 2000);
    // Processing completion is handled by the parent page
    return () => clearTimeout(stepTimer);
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

// Global injection to allow reused DocumentUploadSection to access the processing view without modifying its code
if (typeof window !== "undefined") {
  window.OcrProcessingView = OcrProcessingView;
}

/**
 * Main OCR Summarization Page Component
 */
export default function OCRSummarization() {
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [errorHeader, setErrorHeader] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRegenerateToast, setShowRegenerateToast] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { 
    documentData, 
    correctOutput, 
    updateDocumentData, 
    resetDocumentData 
  } = useOcrMockData();

  const MAX_FILE_SIZE =50000000; // 50MB

  const handleFileSelected = (file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      setErrorHeader(`Upload failed. The file "${file.name}" exceeds the 50MB size limit for OCR processing.`);
      setStatus("error");
      return;
    }
    setSelectedFile(file);
    setStatus("idle"); 
  };

  const handleUploadComplete = (file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      setStatus("error");
      return;
    }

    setSelectedFile(file);
    
    // Synchronized transition to results after the "Relevant Time" has passed
    setTimeout(() => {
      correctOutput(file);
      setStatus("success");
    }, 5500);
  };

  const handleRegenerate = () => {
    setShowRegenerateToast(true);
    setTimeout(() => setShowRegenerateToast(false), 3000);
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

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* 
          Main Upload & Process Part: 
          Reuses Sidebar, Topbar (via Layout), and DocumentUploadSection.
      */}
      {status === "idle" && (
        <DocumentUploadSection
          variant="ocr"
          title="OCR Summarization"
          subtitle="Upload an image or PDF to extract text and generate a summary."
          onFileSelected={handleFileSelected}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Error State Matching Provided Screenshot */}
      {status === "error" && (
        <UploadCard title="OCR Summarization" subtitle="The document could not be processed">
          <ErrorStateCard 
            message="Upload failed. The file is corrupted or exceeds the size limit." 
            onTryAgain={resetAll} 
          />
        </UploadCard>
      )}

      {/* Success Part: "OCR Summarization Result" */}
      {status === "success" && (
        <UploadCard title="OCR Summarization Result" subtitle={`Processed ${selectedFile?.name}`}>
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
