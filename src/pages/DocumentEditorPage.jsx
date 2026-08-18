import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import Layout from "../components/Layout/Layout";
import OnlyOfficeEditor from "../components/Preview/OnlyOfficeEditor";
import SaveChangesModal from "../components/documents/version/SaveChangesModal";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import { request } from "../api/apiClient";
import { teamsApi } from "../services/teamsApi";
import authService from "../services/authService";
import { verifyDocumentPassword } from "../services/documentProtectionService";
import { canEditDocument } from "../utils/DocumentPermissionUtils";
import {
  hasValidUnlockSession,
  isDocumentProtected,
  isInvalidPasswordError,
  setUnlockSession,
} from "../utils/documentProtection";
import AccessDeniedPage from "./AccessDeniedPage";
import { toast } from "react-toastify";
import {
  saveDocumentChangeSummary,
} from "../services/documentVersionService";

export default function DocumentEditorPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [document, setDocument] = useState(null);
  const [userTeamRole, setUserTeamRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDocumentAndRole = async () => {
      try {
        setLoading(true);
        setCheckingPermissions(true);
        const docData = await request(`/documents/${documentId}`);
        if (!mounted) return;
        setDocument(docData);

        const isProtected = isDocumentProtected(docData);
        const unlocked = !isProtected || hasValidUnlockSession(documentId);
        setIsUnlocked(unlocked);

        if (isProtected && !hasValidUnlockSession(documentId)) {
          setVerifyOpen(true);
        }

        if (docData?.teamId) {
          try {
            const teams = await teamsApi.getMyTeams();
            const myTeam = teams?.find((t) => String(t.id) === String(docData.teamId));
            if (!mounted) return;
            setUserTeamRole(myTeam?.currentUserRole || "");
          } catch (tErr) {
            console.error("Failed to fetch user teams role", tErr);
            if (mounted) setUserTeamRole("");
          }
        }
      } catch (error) {
        if (mounted) {
          toast.error("Failed to load document details");
          console.error(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setCheckingPermissions(false);
        }
      }
    };

    fetchDocumentAndRole();
    return () => {
      mounted = false;
    };
  }, [documentId]);

  async function handleVerifyPassword(password) {
    setVerifyLoading(true);
    setVerifyError("");
    try {
      const { unlockSession } = await verifyDocumentPassword(documentId, password);
      setUnlockSession(documentId, unlockSession);
      setVerifyOpen(false);
      setIsUnlocked(true);
      toast.success("Document unlocked for this session.");
    } catch (err) {
      const raw = String(err?.message || "");
      const invalidPassword = isInvalidPasswordError(raw);
      setVerifyError(invalidPassword ? "Invalid password." : raw || "Unable to verify password.");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleSaveChanges(changeSummary) {
    setSaving(true);
    try {
      await saveDocumentChangeSummary(documentId, changeSummary);
      const forced = await editorRef.current?.forceSave?.();
      if (forced === false) {
        toast.warn("Save sent to ONLYOFFICE. If changes are missing, wait a moment and reopen the document.");
      }
      toast.success("Changes saved successfully.");
      setSaveModalOpen(false);
      navigate(`/documents/${documentId}/preview?edited=true`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || checkingPermissions) {
    return (
      <Layout pageTitle="Loading..." pageSubtitle="Preparing ONLYOFFICE Editor">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  const currentUserId = authService.getUserId();
  const currentUserGlobalRole = authService.getUserRole();

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
      <PasswordVerifyModal
        open={verifyOpen}
        documentName={document?.name || "Document"}
        loading={verifyLoading}
        error={verifyError}
        onClose={() => {
          setVerifyOpen(false);
          navigate(-1);
        }}
        onUnlock={handleVerifyPassword}
      />

      <SaveChangesModal
        open={saveModalOpen}
        loading={saving}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveChanges}
      />

      <div className="flex flex-col h-full gap-4">
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

          <button
            type="button"
            onClick={() => setSaveModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>

        <div
          className={[
            "flex-1 min-h-[600px] bg-gray-100 dark:bg-card rounded-xl overflow-hidden shadow-inner",
            isUnlocked ? "opacity-100" : "pointer-events-none opacity-60",
          ].join(" ")}
        >
          <OnlyOfficeEditor 
            ref={editorRef} 
            documentId={documentId} 
            enabled={isUnlocked}
          />
        </div>
      </div>
    </Layout>
  );
}
