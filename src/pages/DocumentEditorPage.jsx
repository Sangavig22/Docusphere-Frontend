import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Layout from "../components/Layout/Layout";
import OnlyOfficeEditor from "../components/Preview/OnlyOfficeEditor";
import { request } from "../api/apiClient";
import { teamsApi } from "../services/teamsApi";
import authService from "../services/authService";
import { canEditDocument } from "../utils/DocumentPermissionUtils";
import AccessDeniedPage from "./AccessDeniedPage";
import { toast } from "react-toastify";

export default function DocumentEditorPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [userTeamRole, setUserTeamRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const fetchDocumentAndRole = async () => {
      try {
        setLoading(true);
        setCheckingPermissions(true);
        const docData = await request(`/documents/${documentId}`);
        setDocument(docData);

        if (docData?.teamId) {
          try {
            const teams = await teamsApi.getMyTeams();
            const myTeam = teams?.find((t) => String(t.id) === String(docData.teamId));
            setUserTeamRole(myTeam?.currentUserRole || "");
          } catch (tErr) {
            console.error("Failed to fetch user teams role", tErr);
            setUserTeamRole("");
          }
        }
      } catch (error) {
        toast.error("Failed to load document details");
        console.error(error);
      } finally {
        setLoading(false);
        setCheckingPermissions(false);
      }
    };

    fetchDocumentAndRole();
  }, [documentId]);

  if (loading || checkingPermissions) {
    return (
      <Layout pageTitle="Loading..." pageSubtitle="Preparing ONLYOFFICE Editor">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;
  const currentUserGlobalRole = currentUser?.role;

  const hasEditPermission = canEditDocument(
    document,
    currentUserId,
    currentUserGlobalRole,
    userTeamRole
  );

  if (!hasEditPermission) {
    return <AccessDeniedPage />;
  }

  return (
    <Layout 
      pageTitle={document?.name || "Edit Document"} 
      pageSubtitle="Edit your document via ONLYOFFICE Community Edition"
    >
      <div className="flex flex-col h-full gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-xl shadow-sm border dark:border-border">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/documents/${documentId}/preview?edited=true`)}
              className="flex items-center gap-2 p-2 px-3 hover:bg-gray-100 dark:hover:bg-card/50 rounded-lg transition-colors text-sm font-semibold text-gray-700 dark:text-text"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Preview
            </button>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-border" />
            <div className="flex items-center gap-2 px-2">
               <span className="font-semibold text-gray-800 dark:text-text">Editor Mode: ONLYOFFICE</span>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-[600px] bg-gray-100 dark:bg-card rounded-xl overflow-hidden shadow-inner">
          <OnlyOfficeEditor document={document} documentId={documentId} />
        </div>
      </div>
    </Layout>
  );
}
