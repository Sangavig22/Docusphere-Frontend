import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import Layout from "../components/Layout/Layout";
import OnlyOfficeEditor from "../components/Preview/OnlyOfficeEditor";
import SaveChangesModal from "../components/documents/version/SaveChangesModal";
import { request } from "../api/apiClient";
import { saveDocumentChangeSummary } from "../services/documentVersionService";
import { toast } from "react-toastify";

export default function OnlineEditorWorkspace() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load document details to display title
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const data = await request(`/documents/${documentId}`);
        setDocument(data);
      } catch (err) {
        console.error("Failed to load document details:", err);
        toast.error("Failed to load document details");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [documentId]);

  // Handle Save
  async function handleSaveChanges(changeSummary) {
    setSaving(true);
    try {
      // Save summary in database
      await saveDocumentChangeSummary(documentId, changeSummary);

      // Force ONLYOFFICE to save changes to storage
      const forced = await editorRef.current?.forceSave?.();
      if (forced === false) {
        toast.warn("Save requested, but force-save could not be executed directly. ONLYOFFICE will save changes shortly.");
      }

      toast.success("Changes saved successfully");
      setSaveModalOpen(false);
      // Navigate back to My Documents
      navigate("/documents");
    } catch (err) {
      console.error("Failed to save changes:", err);
      toast.error(err instanceof Error ? err.message : "Unable to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout pageTitle="Loading..." pageSubtitle="Preparing ONLYOFFICE Editor">
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  // Use the passed config if available, otherwise ONLYOFFICE component fetches automatically
  const initialConfig = location.state?.editorConfig || null;

  return (
    <Layout 
      pageTitle={document?.name || "Edit Document"} 
      pageSubtitle="Make changes to your document in real-time."
    >
      <SaveChangesModal
        open={saveModalOpen}
        loading={saving}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveChanges}
      />

      <div className="flex flex-col h-full gap-4">
        {/* Workspace Toolbar */}
        <div className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-xl shadow-sm border dark:border-border">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/online-editor")}
              className="flex items-center gap-2 p-2 px-3 hover:bg-gray-100 dark:hover:bg-card/50 rounded-lg transition-colors text-sm font-semibold text-gray-700 dark:text-text"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Online Editor
            </button>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-border" />
            <div className="flex items-center gap-2 px-2">
              <span className="font-semibold text-gray-800 dark:text-text">
                Editor: ONLYOFFICE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/documents")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-gray-100 dark:hover:bg-card/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Save size={16} />
              Save & Exit
            </button>
          </div>
        </div>

        {/* Editor Container */}
        <div className="flex-1 min-h-[600px] bg-gray-100 dark:bg-card rounded-xl overflow-hidden shadow-inner">
          <OnlyOfficeEditor 
            ref={editorRef} 
            documentId={documentId} 
            externalConfig={initialConfig} 
          />
        </div>
      </div>
    </Layout>
  );
}
