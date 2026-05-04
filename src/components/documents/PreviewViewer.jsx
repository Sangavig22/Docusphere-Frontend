import React, { useState, useEffect } from "react";

export default function PreviewViewer({ fileUrl, fileName, fileType }) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    if (fileUrl && fileType?.toLowerCase() === "pdf") {
      setIsLoadingPdf(true);
      fetch(fileUrl)
        .then((res) => res.blob())
        .then((blob) => {
          objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
          setPdfBlobUrl(objectUrl);
          setIsLoadingPdf(false);
        })
        .catch((err) => {
          console.error("Failed to fetch PDF", err);
          setPdfBlobUrl(fileUrl);
          setIsLoadingPdf(false);
        });
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileUrl, fileType]);

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 border rounded-xl">
        <p className="text-gray-400">Loading preview...</p>
      </div>
    );
  }

  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(fileType?.toLowerCase());
  const isPdf = fileType?.toLowerCase() === "pdf";
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
              src={pdfBlobUrl ? `${pdfBlobUrl}#toolbar=0` : `${fileUrl}#toolbar=0`}
              title={fileName}
              className="w-full h-full border-none"
            />
          )
        ) : isImage ? (
          <div className="flex items-center justify-center min-h-full p-4">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full h-auto shadow-lg rounded"
            />
          </div>
        ) : isOfficeDoc ? (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            title={fileName}
            className="w-full h-full border-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
             <div className="p-4 bg-white rounded-lg shadow-sm border text-center">
                <p className="text-gray-600 mb-4">Preview not available for this file type ({fileType}).</p>
                <a 
                  href={fileUrl} 
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
