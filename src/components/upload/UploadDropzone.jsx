
export default function UploadDropzone({
  onFileSelected,
  disabled = false,
  variant = "default",
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg",
}) {
  const isOcr = variant === "ocr";
  const inputId = isOcr ? "upload-input-ocr" : "upload-input";

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file && onFileSelected) onFileSelected(file);
    e.target.value = "";
  }

  function handleClick() {
    if (disabled) return;
    document.getElementById(inputId)?.click();
  }

  function handleKeyDown(e) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="File upload area. Press Enter or Space to browse files."
      className={[
        "flex min-h-[240px] sm:min-h-[300px] md:min-h-[360px] min-w-0 w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-300 px-6 py-7 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:gap-4 sm:px-8 sm:py-10 md:px-10 md:py-12",
        "bg-white",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 hover:bg-slate-50/50",
      ].join(" ")}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={(e) => !disabled && e.preventDefault()}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && onFileSelected) onFileSelected(file);
      }}
    >
      <input
        id={inputId}
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
        accept={accept}
      />

      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 sm:h-20 sm:w-20">
        <svg className="h-10 w-10 text-blue-600 sm:h-11 sm:w-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      {isOcr ? (
        <div className="flex w-full min-w-0 max-w-md flex-col items-center gap-1.5">
          <p className="text-base font-medium text-slate-800 sm:text-lg">
            Upload Document for OCR. Drag and drop or click to select
          </p>
          <p className="text-sm text-slate-500">Images, scans, or PDFs.</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={disabled}
            className="mt-2 w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:text-base"
          >
            Select Files
          </button>
        </div>
      ) : (
        <div className="flex w-full min-w-0 max-w-md flex-col items-center gap-1.5">
          <p className="text-base font-medium text-slate-800 sm:text-lg">Drag & drop files here</p>
          <p className="text-sm text-slate-600 sm:text-base">
            or <span className="text-blue-600 underline">browse</span> to upload
          </p>
          <p className="text-xs text-slate-500 sm:text-sm">Maximum file size: 50MB</p>
        </div>
      )}
    </div>
  );
}