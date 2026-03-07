import { useState } from "react";
import Sidebar from "../../components/Layout/Sidebar";
import Topbar from "../../components/Layout/Topbar";
import DocumentUploadSection from "../../components/upload/DocumentUploadSection";
import useOcrFlow from "../../hooks/useOcrFlow";
import DeleteConfirmModal from "../../components/ocr/DeleteConfirmModal";
import EditDocumentModal from "../../components/ocr/EditDocumentModal";
import ProcessingStateCard from "../../components/ocr/ProcessingStateCard";
import RegenerateToast from "../../components/ocr/RegenerateToast";
import ResultCards from "../../components/ocr/ResultCards";
import SuccessBanner from "../../components/ocr/SuccessBanner";

export default function OcrSummarizationPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    status,
    uploadPercent,
    selectedFile,
    processingStep,
    steps,
    result,
    errorMessage,
    editModalOpen,
    deleteModalOpen,
    isRegenerating,
    toast,
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
  } = useOcrFlow();

  const currentUser = { name: "Nilaks", email: "nilaks@example.com" };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((previous) => !previous)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={currentUser}
          title="OCR & Summarization"
          subtitle="Extract text from images and documents, generate AI summaries"
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            <DocumentUploadSection
              variant="ocr"
              title="Upload Documents"
              subtitle="Supported formats: PDF, DOC, XLS, PPT, PNG, JPG"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
              status={status}
              selectedFile={selectedFile}
              percent={uploadPercent}
              errorMsg={errorMessage}
              onFileSelected={startUpload}
              onCancel={cancelUpload}
              onRetry={retryFromError}
              onChooseNew={retryFromError}
            >
              {status === "processing" && (
                <ProcessingStateCard
                  fileName={selectedFile?.name}
                  activeStep={processingStep}
                  steps={steps}
                  onCancel={cancelUpload}
                />
              )}

              {status === "success" && result && (
                <div className="space-y-4">
                  <SuccessBanner fileName={selectedFile?.name || result.fileName} />
                  <ResultCards
                    document={result}
                    onRegenerate={regenerateSummary}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    isRegenerating={isRegenerating}
                  />
                </div>
              )}
            </DocumentUploadSection>
          </div>
        </main>
      </div>

      <EditDocumentModal
        open={editModalOpen}
        document={result}
        onCancel={closeEditModal}
        onSave={saveEdits}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        fileName={selectedFile?.name || result?.fileName}
        onCancel={closeDeleteModal}
        onDelete={confirmDelete}
      />

      <RegenerateToast
        show={toast.open}
        title={toast.title}
        subtitle={toast.subtitle}
        onClose={closeToast}
      />
    </div>
  );
}
