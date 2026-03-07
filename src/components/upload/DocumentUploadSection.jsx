import { useState } from "react";
import UploadCard from "./UploadCard";
import UploadDropzone from "./UploadDropzone";
import UploadProgress from "./UploadProgress";
import UploadErrorBox from "./UploadErrorBox";


export default function DocumentUploadSection({
  variant = "default",
  title = "Upload Documents",
  subtitle = "Supported formats: PDF, DOC, XLS, PPT, PNG, JPG",
  accept,
  onFileSelected: onFileSelectedProp,
  onUploadComplete,
}) {
  const [status, setStatus] = useState("idle");
  const [percent, setPercent] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const isOcr = variant === "ocr";
  const defaultAccept = isOcr
    ? ".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
    : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg";

  function handleFileSelected(file, isRetry = false) {
    setSelectedFile(file);
    setErrorMsg("");
    setStatus("uploading");
    setPercent(0);
    onFileSelectedProp?.(file);

    // upload progress bar
    let p = 0;
    const timer = setInterval(() => {
      p += 10;
      setPercent(p);
      if (p >= 100) {
        clearInterval(timer);
        if (isOcr) {
          setStatus("processing");
          onUploadComplete?.(file);
        } else {
          //file error
          if (file?.size > 1_000_000) {
            setErrorMsg("Upload failed. The file is corrupted or exceeds the size limit.");
            if (isRetry) setRetryCount((c) => c + 1);
            setStatus("error");
          } else {
            setStatus("success");
            onUploadComplete?.(file);
          }
        }
      }
    }, 200);
  }

  function handleTryAgain() {
    if (!selectedFile) {
      resetUpload();
      return;
    }
    // If two times  upload failed,uplaod  another file
    if (retryCount >= 1) {
      resetUpload();
      return;
    }
    handleFileSelected(selectedFile, true);
  }

  function resetUpload() {
    setStatus("idle");
    setPercent(0);
    setSelectedFile(null);
    setErrorMsg("");
    setRetryCount(0);
  }

  return (
    <div className="flex min-h-0 w-full max-w-6xl flex-1 flex-col">
      <UploadCard title={title} subtitle={subtitle}>
        {status === "idle" && (
          <UploadDropzone
            onFileSelected={handleFileSelected}
            accept={accept ?? defaultAccept}
            variant={variant}
          />
        )}

        {status === "uploading" && (
          <div className="space-y-4">
            <UploadDropzone disabled accept={accept ?? defaultAccept} variant={variant} />
            <UploadProgress
              filename={selectedFile?.name || "file"}
              percent={percent}
              fileSize={selectedFile?.size}
              showCancel
              onCancel={resetUpload}
            />
          </div>
        )}

        {status === "error" && (
          <UploadErrorBox
            message={errorMsg || "Upload failed. The file is corrupted or exceeds the size limit."}
            onRetry={handleTryAgain}
            onChooseNew={resetUpload}
            showChooseNew={retryCount >= 1}
          />
        )}

        {status === "success" && !isOcr && (
          <div className="flex min-h-[340px] min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <span className="font-bold text-green-700">✓</span>
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
        )}

        {status === "processing" && isOcr && (
          <OcrProcessingView filename={selectedFile?.name} onCancel={resetUpload} />
        )}
      </UploadCard>
    </div>
  );
}

