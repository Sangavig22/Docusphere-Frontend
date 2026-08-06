import React, { useState, useEffect } from "react";

export default function PreviewViewer({ fileUrl, fileName, fileType, updatedAt }) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const objectUrlRef = React.useRef(null);

  const cacheBustedUrl = React.useMemo(() => {
    if (!fileUrl) return null;
    if (fileUrl.includes("cb=")) return fileUrl;
    const separator = fileUrl.includes("?") ? "&" : "?";
    
    let parsedTime = Date.now();
    if (updatedAt) {
      if (Array.isArray(updatedAt)) {
        parsedTime = new Date(
          updatedAt[0],
          updatedAt[1] - 1,
          updatedAt[2],
          updatedAt[3] || 0,
          updatedAt[4] || 0,
          updatedAt[5] || 0,
          Math.floor((updatedAt[6] || 0) / 1000000)
        ).getTime();
      } else {
        const d = new Date(updatedAt);
        if (!isNaN(d.getTime())) {
          parsedTime = d.getTime();
        }
      }
    }
    
    return `${fileUrl}${separator}cb=${parsedTime}`;
  }, [fileUrl, updatedAt]);

  useEffect(() => {
    if (cacheBustedUrl && fileType?.toLowerCase() === "pdf") {
      fetch(cacheBustedUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
          objectUrlRef.current = url;
          setPdfBlobUrl(url);
        })
        .catch((err) => {
          console.error("Failed to fetch PDF", err);
          setPdfBlobUrl(cacheBustedUrl);
        });
    }

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPdfBlobUrl(null);
    };
  }, [cacheBustedUrl, fileType]);

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 border rounded-xl">
        <p className="text-gray-400">Loading preview...</p>
      </div>
    );
  }

  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(fileType?.toLowerCase());
  const isPdf = fileType?.toLowerCase() === "pdf";
  const isLoadingPdf = isPdf && !pdfBlobUrl;
  const isOfficeDoc = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileType?.toLowerCase());

  return (
    <div className="h-full w-full bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto bg-gray-200">
        {isPdf ? (
          isLoadingPdf ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <iframe
              src={pdfBlobUrl ? `${pdfBlobUrl}#toolbar=0` : `${cacheBustedUrl}#toolbar=0`}
              title={fileName}
              className="w-full h-full border-none"
            />
          )
        ) : isImage ? (
          <div className="flex items-center justify-center min-h-full p-4">
            <img
              src={cacheBustedUrl}
              alt={fileName}
              className="max-w-full h-auto shadow-lg rounded"
            />
          </div>
        ) : isOfficeDoc ? (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cacheBustedUrl)}`}
            title={fileName}
            className="w-full h-full border-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
             <div className="p-4 bg-white rounded-lg shadow-sm border text-center">
                <p className="text-gray-600 mb-4">Preview not available for this file type ({fileType}).</p>
                <a 
                  href={cacheBustedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Download to View
                </a>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
