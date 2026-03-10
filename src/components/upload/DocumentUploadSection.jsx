import { useState } from "react";
import UploadCard from "./UploadCard";
import UploadProgress from "./UploadProgress";

export default function DocumentUploadSection({
  variant = "default",
  title = "Upload Documents",
  subtitle = "Supported formats: PDF, DOC, XLS, PPT, PNG, JPG",
  accept,
  onFileSelected: onFileSelectedProp,
  onUploadComplete,
  status: controlledStatus,
  selectedFile: controlledFile,
  percent: controlledPercent,
  errorMsg: controlledError,
  onCancel: controlledCancel,
  onRetry: controlledRetry,
  onChooseNew: controlledChooseNew,
  children,
}) {
  const [status, setStatus] = useState("idle");
  const [percent, setPercent] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const isOcr = variant === "ocr";
  const isControlled = Boolean(controlledStatus);
  const inputId = isOcr ? "upload-input-ocr" : "upload-input";

  const currentStatus = isControlled ? controlledStatus : status;
  const currentPercent = isControlled ? controlledPercent ?? 0 : percent;
  const currentFile = isControlled ? controlledFile : selectedFile;
  const currentError = isControlled ? controlledError : errorMsg;

  const defaultAccept = isOcr
    ? ".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
    : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg";

  function handleFileSelected(file, isRetry = false) {
    if (isControlled) {
      onFileSelectedProp?.(file);
      return;
    }

    setSelectedFile(file);
    setErrorMsg("");
    setStatus("uploading");
    setPercent(0);
    onFileSelectedProp?.(file);

    let p = 0;
    const timer = setInterval(() => {
      p += 10;
      setPercent(p);
      if (p >= 100) {
        clearInterval(timer);
        if (isOcr) {
          setStatus("processing");
          onUploadComplete?.(file);
        } else if (file?.size > 1_000_000) {
          setErrorMsg("Upload failed. The file is corrupted or exceeds the size limit.");
          if (isRetry) setRetryCount((count) => count + 1);
          setStatus("error");
        } else {
          setStatus("success");
          onUploadComplete?.(file);
        }
      }
    }, 200);
  }

  function resetUpload() {
    if (isControlled) {
      controlledChooseNew?.();
      return;
    }

    setStatus("idle");
    setPercent(0);
    setSelectedFile(null);
    setErrorMsg("");
    setRetryCount(0);
  }

  function handleTryAgain() {
    if (isControlled) {
      controlledRetry?.();
      return;
    }

    if (!selectedFile) {
      resetUpload();
      return;
    }

    if (retryCount >= 1) {
      resetUpload();
      return;
    }

    handleFileSelected(selectedFile, true);
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    e.target.value = "";
  }

  function handleDrop(e) {
    if (currentStatus !== "idle") return;
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  }

  function openFileDialog() {
    if (currentStatus !== "idle") return;
    document.getElementById(inputId)?.click();
  }

  return (
    <div className="flex min-h-0 w-full max-w-6xl flex-1 flex-col">
      <UploadCard title={title} subtitle={subtitle}>
        {(currentStatus === "idle" || currentStatus === "uploading") && (
          <div
            role="button"
            tabIndex={0}
            onClick={openFileDialog}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openFileDialog()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex min-h-[360px] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-blue-300 bg-white px-10 py-12 text-center transition-colors hover:border-blue-400 hover:bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:min-h-[430px]"
          >
            <input id={inputId} type="file" className="hidden" onChange={handleInputChange} accept={accept ?? defaultAccept} />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 md:h-20 md:w-20">
              <svg className="h-10 w-10 text-blue-600 md:h-12 md:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-slate-800 md:text-xl">
              {isOcr ? "Upload Document for OCR. Drag and drop or click to select" : "Drag and drop files here"}
            </p>
            <p className="text-base text-slate-500">{isOcr ? "Images, scans, or PDFs." : "Maximum file size: 10MB"}</p>
            {isOcr && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                className="mt-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
              >
                Select Files
              </button>
            )}
          </div>
        )}

        {currentStatus === "uploading" && (
          <div className="mt-4">
            <UploadProgress
              filename={currentFile?.name || "file"}
              percent={currentPercent}
              fileSize={currentFile?.size}
              showCancel={true}
              onCancel={isControlled ? controlledCancel : resetUpload}
            />
          </div>
        )}

        {currentStatus === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="text-sm">{currentError || "Upload failed. Please try again."}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={handleTryAgain} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">
                Try Again
              </button>
              <button type="button" onClick={resetUpload} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">
                Choose New
              </button>
            </div>
          </div>
        )}

        {currentStatus === "processing" && children}

        {currentStatus === "success" && (children ?? !isOcr) &&
          (!children ? (
            <div className="flex min-h-[340px] min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <span className="font-bold text-green-700">?</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">Upload Successful</h3>
              <p className="text-sm text-slate-500">Your document has been uploaded.</p>
              <button
                onClick={resetUpload}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Upload Another File
              </button>
            </div>
          ) : (
            children
          ))}
      </UploadCard>
    </div>
  );
}

