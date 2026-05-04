import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Download, FileText, Clock, ExternalLink } from "lucide-react";
import Layout from "../components/Layout/Layout";
import PreviewViewer from "../components/documents/PreviewViewer";
import CommentSection from "../components/documents/CommentSection";
import { request } from "../api/apiClient";
import { toast } from "react-toastify";

export default function DocumentPreviewPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const data = await request(`/documents/${documentId}`);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to load document");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleDownload = () => {
    if (document?.fileUrl) {
      const link = window.document.createElement("a");
      link.href = document.fileUrl;
      link.download = document.name || "download";
      link.target = "_blank";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const formatUpdatedDate = (date) => {
    if (!date) return "N/A";
    try {
      // Handle array format [yyyy, mm, dd...] if backend sends it
      if (Array.isArray(date)) {
        return new Date(date[0], date[1] - 1, date[2], date[3] || 0, date[4] || 0).toLocaleString();
      }
      const d = new Date(date);
      return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Loading..." pageSubtitle="Fetching document details">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  const fileType = document?.type || document?.name?.split('.').pop();

  return (
    <Layout 
      pageTitle={document?.name || "Document Preview"} 
      pageSubtitle={`Last updated: ${formatUpdatedDate(document?.updatedAt || document?.updated_at)}`}
    >
      <div className="flex flex-col h-full gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="h-8 w-[1px] bg-gray-200" />
            <div className="flex items-center gap-2 px-2">
               <FileText className="h-5 w-5 text-blue-600" />
               <span className="font-medium text-gray-800">{document?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Preview Section (Left) */}
          <div className="flex-[3] flex flex-col min-w-0">
            <PreviewViewer 
              fileUrl={document?.fileUrl} 
              fileName={document?.name}
              fileType={fileType}
            />
          </div>

          {/* Sidebar Section (Right) */}
          <div className="flex-1 flex flex-col gap-4 w-80">


            {/* Comment Section */}
            <div className="flex-1 min-h-0">
              <CommentSection documentId={documentId} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
