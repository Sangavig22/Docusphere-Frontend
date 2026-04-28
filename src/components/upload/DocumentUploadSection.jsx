import UploadCard from "./UploadCard";
import UploadDropzone from "./UploadDropzone";
import UploadProgress from "./UploadProgress";
import UploadErrorBox from "./UploadErrorBox";
import { uploadConfig } from "../../config/uploadConfig";
import { useUpload } from "../../hooks/useUpload";

export default function DocumentUploadSection({
  variant = "default",
  title = "Upload Files",
  subtitle = "Supported formats",
  accept,
  onFileSelected,
  onUploadComplete,
}) {
  const isOcr = variant === "ocr";

  //  use reusable hook
  const {
    status,
    percent,
    file,
    error,
    startUpload,
    reset,
  } = useUpload(onUploadComplete);

  const defaultAccept = isOcr
    ? uploadConfig.ocrFormats
    : uploadConfig.defaultFormats;

  //  wrapper to inject external callback
  const handleFileUpload = (file) => {
    onFileSelected?.(file);
    startUpload(file);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col">
      <UploadCard title={title} subtitle={subtitle}>
        
        {/* IDLE */}
        {status === "idle" && (
          <UploadDropzone
            onFileSelected={handleFileUpload}
            accept={accept ?? defaultAccept}
            variant={variant}
          />
        )}

        {/* UPLOADING */}
        {status === "uploading" && (
          <div className="space-y-5">
            <UploadDropzone disabled accept={accept ?? defaultAccept} variant={variant} />

            <UploadProgress
              filename={file?.name || "file"}
              percent={percent}
              fileSize={file?.size}
              showCancel
              onCancel={reset}
            />
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <UploadErrorBox
            message={error}
            onRetry={() => file && startUpload(file)}
            onChooseNew={reset}
            showChooseNew
          />
        )}

        {/* SUCCESS */}
        {status === "success" && !isOcr && (
          <div className="flex flex-col items-center gap-4 text-center">
            <h3 className="text-lg font-semibold text-green-600">
              Upload Successful
            </h3>

            <button onClick={reset} className="btn-primary">
              Upload Another File
            </button>
          </div>
        )}
      </UploadCard>
    </div>
  );
}