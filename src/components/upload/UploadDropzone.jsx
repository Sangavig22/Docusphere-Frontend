
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
        "flex min-h-[180px] sm:min-h-[220px] md:min-h-[280px] min-w-0 w-full flex-1 flex-col items-center justify-center gap-2 sm:gap-3 rounded-xl border-2 border-dashed border-blue-300 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
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

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
        <svg className="h-9 w-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      {isOcr ? (
        <div className="flex w-full min-w-0 max-w-sm flex-col items-center gap-1">
          <p className="text-sm sm:text-base font-medium text-slate-800">
            Upload Document for OCR. Drag and drop or click to select
          </p>
          <p className="text-sm text-slate-600">Images, scans, or PDFs.</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={disabled}
            className="mt-2 w-full sm:w-auto rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Select Files
          </button>
        </div>
      ) : (
        <div className="flex w-full min-w-0 max-w-sm flex-col items-center gap-1">
          <p className="text-sm sm:text-base font-semibold text-slate-800">Drag & drop files here</p>
          <p className="text-sm text-slate-600">
            or <span className="text-blue-600 underline">browse</span> to upload
          </p>
          <p className="text-sm text-slate-600">Maximum file size: 50MB</p>
        </div>
      )}
    </div>
  );
}