import { useState, useEffect } from "react";
import DocumentUploadSection from "../components/upload/DocumentUploadSection";
import UploadCard from "../components/upload/UploadCard";
import SuccessBanner from "../components/ocr/SuccessBanner";
import ResultCards from "../components/ocr/ResultCards";
import ProcessingStateCard from "../components/ocr/ProcessingStateCard";
import RegenerateToast from "../components/ocr/RegenerateToast";
import DeleteConfirmModal from "../components/ocr/DeleteConfirmModal";
import EditDocumentModal from "../components/ocr/EditDocumentModal";
import ErrorStateCard from "../components/ocr/ErrorStateCard";
import { useOcrState } from "../hooks/useOcrState";
import { ocrService } from "../services/ocrService";

/**
 * OcrProcessingView is defined here to provide the "Upload Process Section"
 * logic required by the reused DocumentUploadSection component.
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

// Global injection for the shared DocumentUploadSection
if (typeof window !== "undefined") {
  window.OcrProcessingView = OcrProcessingView;
}

/**
 * Main OCR Summarization Page Component
 */
export default function OCRSummarization() {
  const [status, setStatus] = useState("idle"); // idle, regenerating, success, error
  const [errorHeader, setErrorHeader] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showRegenerateToast, setShowRegenerateToast] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { 
    documentData, 
    updateDocumentData, 
    resetDocumentData,
    setDocumentResults
  } = useOcrState();

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

  const handleUploadComplete = async (file) => {
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE) {
      setStatus("error");
      return;
    }

    setSelectedFile(file);
    
    try {
      // 1. Initial Upload Call (Returns Job ID)
      const { jobId } = await ocrService.uploadDocument(file);
      
      // 2. Polling loop
      let isDone = false;
      while (!isDone) {
        const status = await ocrService.checkStatus(jobId);
        
        if (status.status === "COMPLETED") {
          setDocumentResults(status.result);
          setStatus("success");
          isDone = true;
        } else if (status.status === "FAILED") {
          throw new Error(status.error || "Processing failed");
        } else {
          // Map backend status to frontend steps (1-based index)
          // Backend states: UPLOADING, EXTRACTING, SUMMARIZING
          let step = 1;
          if (status.status === "EXTRACTING") step = 2;
          if (status.status === "SUMMARIZING") step = 3;
          
          window.dispatchEvent(new CustomEvent("ocr-progress", { detail: { step } }));
          
          // Wait before next poll
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setErrorHeader(err.message || "The document could not be processed");
      setStatus("error");
    }
  };

  const handleRegenerate = async () => {
    if (!selectedFile) return;
    setStatus("regenerating");
    
    try {
      const { jobId } = await ocrService.uploadDocument(selectedFile);
      
      let isDone = false;
      while (!isDone) {
        const status = await ocrService.checkStatus(jobId);
        if (status.status === "COMPLETED") {
          setDocumentResults(status.result);
          setStatus("success");
          setShowRegenerateToast(true);
          setTimeout(() => setShowRegenerateToast(false), 3000);
          isDone = true;
        } else if (status.status === "FAILED") {
          throw new Error(status.error || "Regeneration failed");
        } else {
          await new Promise(r => setTimeout(r, 1000));
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

      {/* Regenerating State — spinner shown while re-processing */}
      {status === "regenerating" && (
        <UploadCard title="OCR Summarization" subtitle={`Re-processing ${selectedFile?.name}...`}>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Re-running OCR and AI analysis, please wait...</p>
          </div>
        </UploadCard>
      )}

      {/* Error State Matching Provided Screenshot */}
      {status === "error" && (
        <UploadCard title="OCR Summarization" subtitle="The document could not be processed">
          <ErrorStateCard 
            message={errorHeader || "Upload failed. The file is corrupted or exceeds the size limit."} 
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
