import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Download, FileText, Clock, ExternalLink, Pencil } from "lucide-react";
import Layout from "../components/Layout/Layout";
import PreviewViewer from "../components/Preview/PreviewViewer";
import CommentSection from "../components/Preview/CommentSection";
import { request } from "../api/apiClient";
import { toast } from "react-toastify";
import { teamsApi } from "../services/teamsApi";
import { canEditDocument } from "../utils/DocumentPermissionUtils";
import authService from "../services/authService";
import { downloadDocument } from "../services/documentActionsService";

export default function DocumentPreviewPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const justEdited = queryParams.get("edited") === "true";

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTeamRole, setUserTeamRole] = useState("");

  useEffect(() => {
    let isMounted = true;
    let pollInterval = null;
    let attempts = 0;
    const maxAttempts = 6; // 6 * 2.5 seconds = 15 seconds max

    const getDocTimestamp = (date) => {
      if (!date) return 0;
      if (Array.isArray(date)) {
        return new Date(
          date[0],
          date[1] - 1,
          date[2],
          date[3] || 0,
          date[4] || 0,
          date[5] || 0,
          Math.floor((date[6] || 0) / 1000000)
        ).getTime();
      }
      const d = new Date(date);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };

    const fetchDocumentAndRole = async (isPolling = false, initialUpdatedAt = null) => {
      try {
        if (!isPolling) {
          setLoading(true);
        }
        const data = await request(`/documents/${documentId}`);
        if (!isMounted) return null;

        setDocument(data);

        // If we are polling and the updatedAt timestamp has changed (is newer), stop polling!
        if (isPolling && initialUpdatedAt && data?.updatedAt) {
          const prevTime = getDocTimestamp(initialUpdatedAt);
          const newTime = getDocTimestamp(data.updatedAt);
          if (newTime > prevTime) {
            toast.success("Document changes saved successfully!");
            // Remove the ?edited=true query parameter so we don't poll again if they refresh
            navigate(`/documents/${documentId}/preview`, { replace: true });
            if (pollInterval) clearInterval(pollInterval);
            return null;
          }
        }

        if (data?.teamId) {
          try {
            const teams = await teamsApi.getMyTeams();
            if (!isMounted) return null;
            const myTeam = teams?.find((t) => String(t.id) === String(data.teamId));
            setUserTeamRole(myTeam?.currentUserRole || "");
          } catch (tErr) {
            console.error("Failed to fetch user team role in preview", tErr);
            setUserTeamRole("");
          }
        }
        return data;
      } catch (error) {
        if (!isPolling) {
          toast.error("Failed to load document");
          console.error(error);
        }
        return null;
      } finally {
        if (!isPolling) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchDocumentAndRole().then((initData) => {
      // If we just edited the document, start polling to watch for updates
      if (justEdited && initData) {
        toast.info("Saving changes from ONLYOFFICE...", {
          autoClose: 3000,
          toastId: "onlyoffice-saving"
        });

        // Store initial updatedAt
        const initialUpdatedAt = initData.updatedAt;

        pollInterval = setInterval(() => {
          attempts += 1;
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            // Clear query param
            navigate(`/documents/${documentId}/preview`, { replace: true });
            return;
          }
          fetchDocumentAndRole(true, initialUpdatedAt);
        }, 2500);
      }
    });

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [documentId, justEdited, navigate]);

  const handleDownload = async () => {
    if (!document) return;
    try {
      toast.info("Download starting...");
      await downloadDocument(documentId, document.name || "download");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download document.");
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
    } catch {
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

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;
  const currentUserGlobalRole = currentUser?.role;
  const canEdit = canEditDocument(document, currentUserId, currentUserGlobalRole, userTeamRole);

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
            {canEdit && (
              <button
                onClick={() => navigate(`/editor/${documentId}`)}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
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
              updatedAt={document?.updatedAt || document?.updated_at}
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
