import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, FileSpreadsheet, Presentation, Search, Trash2, Edit, Plus, Calendar, AlertCircle, MoreVertical } from "lucide-react";
import { createOnlineDocument } from "../services/onlineEditorService";
import { fetchMyDocuments } from "../services/documentsService";
import { trashDocument } from "../services/documentActionsService";
import { normalizeDocumentType, formatRelativeTime } from "../utils/documentUtils";
import { toast } from "react-toastify";

import Popover from "../components/documents/Popover";
import DocumentActionsMenu from "../components/documents/DocumentActionsMenu";
import DocumentActionModal from "../components/documents/DocumentActionModal";
import ShareModal from "../components/documents/share/ShareModal";
import SecureFileModal from "../components/documents/secure/SecureFileModal";
import ProtectedMoveBlockedModal from "../components/documents/secure/ProtectedMoveBlockedModal";
import PasswordVerifyModal from "../components/documents/secure/PasswordVerifyModal";
import VersionHistoryModal from "../components/documents/version/VersionHistoryModal";
import useDocumentActions from "../hooks/useDocumentActions";
import { DEFAULT_DOCUMENT_ACTIONS, SHARED_VIEWER_ACTION_KEYS } from "../components/documents/DocumentActionsMenu";

export default function OnlineEditorPage() {
  const navigate = useNavigate();
  
  // State for 3-dot dropdown menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const menuButtonsRef = React.useRef({});

  // Document actions hook
  const {
    modalState,
    verifyState,
    loadingAction,
    handleAction,
    closeModal,
    closeVerifyModal,
    submitModal,
    shareWithPeople,
    enableDocumentProtection,
    changeDocumentPassword,
    removeDocumentProtection,
    resetDocumentPassword,
    submitVerifyPassword,
  } = useDocumentActions({
    onSuccess: (type, doc) => {
      if (type === "preview" && doc) {
        handleOpen(doc.id);
      } else {
        loadDocuments();
      }
    },
  });

  const handleMenuAction = (actionKey, doc) => {
    setMenuOpen(false);
    if (actionKey === "preview") {
      handleOpen(doc.id);
    } else {
      handleAction(actionKey, doc);
    }
  };

  // State for document lists
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeletingId, setIsDeletingId] = useState(null);

  // State for creation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(""); // "word", "spreadsheet", "presentation"
  const [docName, setDocName] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch documents on mount
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchMyDocuments({ page: 1, pageSize: 100 });
      // Filter for office documents only (Word, Sheet, PowerPoint)
      const officeDocs = (result?.documents || []).filter((doc) => {
        const type = normalizeDocumentType(doc.type);
        return type === "word" || type === "sheet" || type === "powerpoint";
      });
      setDocuments(officeDocs);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Failed to load documents. Please check backend connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter documents by search query
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  // Recent documents (up to 4 recently updated)
  const recentDocuments = useMemo(() => {
    return [...filteredDocuments]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);
  }, [filteredDocuments]);

  // Handle open document
  const handleOpen = (docId) => {
    navigate(`/online-editor/edit/${docId}`);
  };

  // Handle delete document
  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to move this document to the Recycle Bin?")) {
      return;
    }
    try {
      setIsDeletingId(docId);
      await trashDocument(docId);
      toast.success("Document moved to Recycle Bin");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast.error("Failed to delete document.");
    } finally {
      setIsDeletingId(null);
    }
  };

  // Handle create document
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      toast.warning("Please enter a document name");
      return;
    }

    try {
      setCreating(true);
      const result = await createOnlineDocument(docName.trim(), selectedType);
      toast.success("Document created successfully");
      setIsCreateModalOpen(false);
      setDocName("");
      // Navigate to online editor workspace, passing the config in location state
      navigate(`/online-editor/edit/${result.documentId}`, {
        state: { editorConfig: result.editorConfig }
      });
    } catch (err) {
      console.error("Failed to create document:", err);
      toast.error(err?.message || "Failed to create document");
    } finally {
      setCreating(false);
    }
  };

  const openCreateModal = (type) => {
    setSelectedType(type);
    setDocName("");
    setIsCreateModalOpen(true);
  };

  // File type specific styles and icons
  const getTypeConfig = (type) => {
    const norm = normalizeDocumentType(type);
    switch (norm) {
      case "word":
        return {
          icon: FileText,
          colorClass: "text-blue-600 dark:text-blue-400",
          bgClass: "bg-blue-50 dark:bg-blue-500/10",
          ringClass: "ring-blue-100 dark:ring-blue-500/20",
          label: "Word Document",
        };
      case "sheet":
        return {
          icon: FileSpreadsheet,
          colorClass: "text-emerald-600 dark:text-emerald-400",
          bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
          ringClass: "ring-emerald-100 dark:ring-emerald-500/20",
          label: "Spreadsheet",
        };
      case "powerpoint":
        return {
          icon: Presentation,
          colorClass: "text-orange-600 dark:text-orange-400",
          bgClass: "bg-orange-50 dark:bg-orange-500/10",
          ringClass: "ring-orange-100 dark:ring-orange-500/20",
          label: "Presentation",
        };
      default:
        return {
          icon: FileText,
          colorClass: "text-gray-600 dark:text-gray-400",
          bgClass: "bg-gray-50 dark:bg-gray-500/10",
          ringClass: "ring-gray-100 dark:ring-gray-500/20",
          label: "Office Document",
        };
    }
  };

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-6 p-1">
      {/* Creation Area */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-text">Create New Document</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Word Option */}
          <button
            onClick={() => openCreateModal("word")}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:hover:border-blue-900 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20 group-hover:scale-110 transition-transform">
              <FileText size={28} />
            </div>
            <div>
              <h4 className="font-semibold text-text group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Word Document</h4>
              <p className="text-xs text-muted mt-1">Create letters, reports, or essays</p>
            </div>
          </button>

          {/* Spreadsheet Option */}
          <button
            onClick={() => openCreateModal("spreadsheet")}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-900 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <h4 className="font-semibold text-text group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Spreadsheet</h4>
              <p className="text-xs text-muted mt-1">Create tables, budgets, or charts</p>
            </div>
          </button>

          {/* Presentation Option */}
          <button
            onClick={() => openCreateModal("presentation")}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:hover:border-orange-900 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20 group-hover:scale-110 transition-transform">
              <Presentation size={28} />
            </div>
            <div>
              <h4 className="font-semibold text-text group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Presentation</h4>
              <p className="text-xs text-muted mt-1">Create slides, proposals, or pitches</p>
            </div>
          </button>
        </div>
      </div>

      <hr className="border-border my-2" />

      {/* Toolbar / Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-text">Recent & Saved Documents</h3>
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-text placeholder-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : (
        <>
          {/* Recent Documents Section */}
          {recentDocuments.length > 0 && !searchQuery && (
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-muted">Recent Documents</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {recentDocuments.map((doc) => {
                  const cfg = getTypeConfig(doc.type);
                  const Icon = cfg.icon;
                  return (
                    <div key={`recent-${doc.id}`} onClick={() => handleOpen(doc.id)} className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:border-gray-300 dark:hover:border-border/80 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${cfg.bgClass} ${cfg.ringClass}`}>
                          <Icon className={cfg.colorClass} size={20} />
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-text truncate" title={doc.name}>
                          {doc.name}
                        </h5>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-muted">
                          <Calendar size={12} />
                          <span>{formatRelativeTime(doc.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(doc.id);
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit size={12} />
                          Open
                        </button>
                        <button
                          ref={(el) => (menuButtonsRef.current[doc.id] = el)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                            setMenuAnchor(menuButtonsRef.current[doc.id]);
                            setMenuOpen(true);
                          }}
                          className="text-xs text-muted hover:text-text hover:bg-surface rounded p-1 transition-all"
                          title="Actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Saved Documents List */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-muted">All Office Documents</h4>
            {filteredDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted shadow-sm">
                No office documents found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDocuments.map((doc) => {
                  const cfg = getTypeConfig(doc.type);
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={`list-${doc.id}`}
                      onClick={() => handleOpen(doc.id)}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-border/80 transition-all min-h-[160px] cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${cfg.bgClass} ${cfg.ringClass}`}>
                          <Icon className={cfg.colorClass} size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-text text-sm leading-snug break-words truncate" title={doc.name}>
                            {doc.name}
                          </h5>
                          <span className="inline-block text-[11px] text-muted mt-0.5">{cfg.label}</span>
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
                            <Calendar size={12} />
                            <span>Modified {formatRelativeTime(doc.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-border">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(doc.id);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-400 transition-colors"
                        >
                          <Edit size={12} />
                          Open Editor
                        </button>
                        <button
                          ref={(el) => (menuButtonsRef.current[doc.id] = el)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                            setMenuAnchor(menuButtonsRef.current[doc.id]);
                            setMenuOpen(true);
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-text hover:bg-surface transition-all"
                          title="Actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Document Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border">
            <h3 className="text-lg font-semibold text-text mb-4">Create New Document</h3>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Document Type
                </label>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getTypeConfig(selectedType).bgClass}`}>
                    {React.createElement(getTypeConfig(selectedType).icon, {
                      className: getTypeConfig(selectedType).colorClass,
                      size: 18
                    })}
                  </div>
                  <span className="text-sm font-medium text-text capitalize">
                    {selectedType === "word" ? "Word Document (.docx)" : selectedType === "spreadsheet" ? "Spreadsheet (.xlsx)" : "Presentation (.pptx)"}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="docName" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Document Name
                </label>
                <input
                  type="text"
                  id="docName"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Enter name (e.g. My Document)"
                  required
                  autoFocus
                  disabled={creating}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm text-text placeholder-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={creating}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-gray-100 dark:hover:bg-card/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Menu Popover */}
      <Popover
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={{ current: menuAnchor }}
        side="auto"
        scrollable
        className="w-52 p-0"
      >
        {selectedDoc && (
          <DocumentActionsMenu
            doc={selectedDoc}
            dense
            onAction={handleMenuAction}
            actions={DEFAULT_DOCUMENT_ACTIONS}
            actionKeys={selectedDoc.isOwner === false ? SHARED_VIEWER_ACTION_KEYS : undefined}
            disabled={selectedDoc.isOwner === false}
          />
        )}
      </Popover>

      {/* Action Modals */}
      <DocumentActionModal
        open={
          modalState.open &&
          modalState.type !== "share" &&
          modalState.type !== "secure_file" &&
          modalState.type !== "protected_move_block" &&
          modalState.type !== "version_history"
        }
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        value={modalState.value}
        options={modalState.options}
        confirmText={modalState.confirmText}
        confirmVariant={modalState.confirmVariant}
        loading={loadingAction}
        onClose={closeModal}
        onConfirm={submitModal}
      />
      <ShareModal
        open={modalState.open && modalState.type === "share"}
        document={modalState.doc}
        loading={loadingAction}
        onClose={closeModal}
        onShareWithPeople={shareWithPeople}
      />
      <ProtectedMoveBlockedModal
        open={modalState.open && modalState.type === "protected_move_block"}
        documentName={modalState.doc?.name}
        loading={loadingAction}
        onClose={closeModal}
        onManageProtection={submitModal}
      />
      <SecureFileModal
        open={modalState.open && modalState.type === "secure_file"}
        document={modalState.doc}
        loading={loadingAction}
        onClose={closeModal}
        onEnableProtection={enableDocumentProtection}
        onChangePassword={changeDocumentPassword}
        onRemoveProtection={removeDocumentProtection}
        onResetPassword={resetDocumentPassword}
      />
      <PasswordVerifyModal
        open={verifyState.open}
        documentName={verifyState.doc?.name}
        loading={loadingAction}
        error={verifyState.error}
        onClose={closeVerifyModal}
        onUnlock={submitVerifyPassword}
      />
      <VersionHistoryModal
        open={modalState.open && modalState.type === "version_history"}
        document={modalState.doc}
        userTeamRole={modalState.doc?.teamRole || ""}
        onClose={closeModal}
        onRestored={() => loadDocuments()}
      />
    </div>
  );
}
