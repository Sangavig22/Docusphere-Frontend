import { useState } from "react";

import UploadCard from "./UploadCard";
import UploadDropzone from "./UploadDropzone";
import UploadErrorBox from "./UploadErrorBox";
import UploadProgress from "./UploadProgress";

export default function DocumentUploadSection({
  variant = "default",
  title = "Upload Files",
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
  const isControlled = controlledStatus != null;

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
          return;
        }

        if (file?.size > 1_000_000) {
          setErrorMsg("Upload failed. The file is corrupted or exceeds the size limit.");
          if (isRetry) setRetryCount((count) => count + 1);
          setStatus("error");
          return;
        }

        setStatus("success");
        onUploadComplete?.(file);
      }
    }, 300);
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

  return (
    <div className="mx-auto flex min-h-0 min-w-0 w-full max-w-[1080px] flex-1 flex-col">
      <UploadCard title={title} subtitle={subtitle}>
        {currentStatus === "idle" && (
          <UploadDropzone
            onFileSelected={handleFileSelected}
            accept={accept ?? defaultAccept}
            variant={variant}
          />
        )}

        {currentStatus === "uploading" && (
          <div className="space-y-5">
            <UploadDropzone disabled accept={accept ?? defaultAccept} variant={variant} />
            <UploadProgress
              filename={currentFile?.name || "file"}
              percent={currentPercent}
              fileSize={currentFile?.size}
              showCancel
              onCancel={isControlled ? controlledCancel : resetUpload}
            />
          </div>
        )}

        {currentStatus === "error" && (
          <UploadErrorBox
            message={currentError || "Upload failed. The file is corrupted or exceeds the size limit."}
            onRetry={handleTryAgain}
            onChooseNew={isControlled ? controlledChooseNew : resetUpload}
            showChooseNew={isControlled ? true : retryCount >= 1}
          />
        )}

        {currentStatus === "processing" && children}

        {currentStatus === "success" && children}

        {currentStatus === "success" && !isOcr && !children && (
          <div className="flex min-h-[240px] min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center sm:min-h-[300px] sm:p-8 md:min-h-[340px] md:p-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
              <span className="font-bold text-green-700">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Upload Successful</h3>
            <p className="text-sm text-slate-500 sm:text-base">Your document has been uploaded.</p>
            <button
              type="button"
              onClick={resetUpload}
              className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto sm:text-base"
            >
              Upload Another File
            </button>
          </div>
        )}
      </UploadCard>
    </div>
  );
}
