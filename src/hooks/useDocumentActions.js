import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  downloadDocument,
  duplicateDocument,
  getTeams,
  moveDocument,
  permanentlyDeleteDocument,
  renameDocument,
  restoreDocumentApi,
  trashDocument,
  shareDocumentByEmail,
} from "../services/documentActionsService";

const EMPTY_MODAL = { open: false, type: "confirm", title: "", message: "" };

function resolveApiId(doc) {
  return doc?.apiId || doc?.documentId || doc?.fileId || doc?.id;
}

function resolveShareIdCandidates(doc) {
  // Try the most common backend id fields and normalize to unique strings.
  const candidates = [
    doc?.documentId,
    doc?.apiId,
    doc?.id,
    doc?.fileId,
    doc?.cloudFileId,
    doc?.objectKey,
  ]
    .map((value) => (value == null ? "" : String(value).trim()))
    .filter(Boolean);

  const unique = Array.from(new Set(candidates));
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Prefer UUID-like ids first because most share endpoints expect canonical ids.
  const uuidCandidates = unique.filter((value) => uuidRegex.test(value));
  const nonUuidCandidates = unique.filter((value) => !uuidRegex.test(value));
  return [...uuidCandidates, ...nonUuidCandidates];
}



function isTeamDocument(doc) {
  // Different API payloads use different team id shapes.
  const teamId = doc?.teamId ?? doc?.teamID ?? doc?.team?.id ?? doc?.team?.teamId;
  return teamId !== null && teamId !== undefined && String(teamId).trim() !== "";
}

function getActionErrorMessage(error, fallback) {
  const raw = error?.message || fallback;
  if (/request failed \(404\)/i.test(raw)) {
    return "Backend endpoint is missing or route is wrong (404).";
  }
  if (/failed to fetch|networkerror|network error/i.test(raw)) {
    return "Cannot connect to backend. Check API server and VITE_API_BASE_URL.";
  }
  return raw;
}

export default function useDocumentActions({ onSuccess } = {}) {
  const [modalState, setModalState] = useState(EMPTY_MODAL);
  const [loadingAction, setLoadingAction] = useState(false);

  async function handleRename(doc, nextName) {
    const name = nextName?.trim();
    if (!name) {
      toast.warning("Document name is required.");
      return;
    }
    const docId = resolveApiId(doc);
    if (!docId) {
      toast.error("Cannot rename: missing document id from backend data.");
      return;
    }
    if (name === doc?.name?.trim()) {
      toast.info("Name is unchanged.");
      setModalState(EMPTY_MODAL);
      return;
    }

    await renameDocument(docId, name);
    toast.success("Document renamed successfully.");
    setModalState(EMPTY_MODAL);
    await onSuccess?.("rename", doc);
  }

  async function handleMove(doc, selectedDestination) {

     let destination;
    if (selectedDestination === "personal") {
      destination = { teamId: null };
    }
    else if (typeof selectedDestination === "string" &&
    selectedDestination.startsWith("team:")) {
      const teamId = selectedDestination.slice(5).trim();
      if (!teamId) {
        throw new Error("Please select a valid team destination.");
      }
      destination = { teamId };
    } else {
      throw new Error("Please select where to move this document.");
    }


    await moveDocument(resolveApiId(doc), destination);
    toast.success("Document moved successfully.");
    setModalState(EMPTY_MODAL);
    await onSuccess?.("move", doc);
  }

  async function runWithGuard(action) {
    setLoadingAction(true);
    try {
      await action();
    } catch (error) {
      toast.error(getActionErrorMessage(error, "Action failed. Please try again."));
    } finally {
      setLoadingAction(false);
    }
  }

    async function openMoveModal(doc) {
    let normalizedTeams = [];
    try {
      const payload = await getTeams();
      const root = payload?.data ?? payload;
      const teams = Array.isArray(root)
        ? root
        : Array.isArray(root?.teams)
          ? root.teams
          : Array.isArray(root?.items)
            ? root.items
            : [];
      normalizedTeams = teams.map((team) => ({
        value: `team:${team.id}`,
        label: team.name || team.teamName || "Unnamed team",
      }));
    } catch {
      toast.warning("Could not load teams. You can still move to personal space.");
    }

    const options = isTeamDocument(doc)
      ? [{ value: "personal", label: "Personal space" }, ...normalizedTeams]
      : normalizedTeams;

    setModalState({
      open: true,
      type: "select",
      title: "Move document",
      message: `Choose destination for "${doc.name}".`,
      doc,
      options,
      confirmText: "Move",
    });
  }

  async function handleAction(actionKey, doc) {
    // Preview is handled by page-level callback to keep this hook reusable.
    if (actionKey === "preview") {
      await onSuccess?.("preview", doc);
      return;
    }

    const restrictedForNonOwner = new Set(["rename", "move", "duplicate", "trash", "delete_permanently", "restore", "share"]);
    if (doc?.isOwner === false && restrictedForNonOwner.has(actionKey)) {
      toast.warning("Only owner can manage this document.");
      return;
    }

    if (actionKey === "rename") {
      setModalState({
        open: true,
        type: "input",
        title: "Rename document",
        message: "Enter a new document name.",
        value: doc.name,
        doc,
        confirmText: "Save",
      });
      return;
    }

    if (actionKey === "share") {
      setModalState({
        open: true,
        type: "share",
        title: "Share document",
        message: `Manage access for "${doc.name}".`,
        doc,
      });
      return;
    }

    if (actionKey === "move") {
      await openMoveModal(doc);
      return;
    }

    if (actionKey === "duplicate") {
      await runWithGuard(async () => {
        await duplicateDocument(resolveApiId(doc));
        toast.success("Document duplicated.");
        await onSuccess?.("duplicate", doc);
      });
      return;
    }

    if (actionKey === "download") {
      await runWithGuard(async () => {
        await downloadDocument(resolveApiId(doc), doc.name);
        toast.success("Download started.");
      });
      return;
    }

    if (actionKey === "trash") {
      setModalState({
        open: true,
        type: "confirm",
        title: "Move to Trash?",
        message: `"${doc.name}" will be moved to recycle bin and can be restored later.`,
        doc,
        confirmText: "Move to Trash",
        confirmVariant: "danger",
      });
      return;
    }

    if (actionKey === "restore") {
      await runWithGuard(async () => {
        await restoreDocumentApi(resolveApiId(doc));
        toast.success("Document restored.");
        await onSuccess?.("restore", doc);
      });
      return;
    }

    if (actionKey === "delete_permanently") {
      setModalState({
        open: true,
        type: "confirm",
        title: "Delete permanently?",
        message: "This action cannot be undone.",
        doc,
        confirmText: "Delete permanently",
        confirmVariant: "danger",
      });
    }
  }

  async function submitModal(value) {
    const doc = modalState.doc;
    if (!doc) return;

    await runWithGuard(async () => {
      if (modalState.type === "input") {
        if (modalState.confirmText === "Share") {
          const email = String(value || "").trim().toLowerCase();
          if (!email) {
            toast.warning("Email is required.");
            return;
          }
          await shareDocumentByEmail(resolveApiId(doc), {
            type: "EMAIL_INVITE",
            permission: "COMMENT",
            emails: [email],
          });
          toast.success("Document shared successfully.");
          setModalState(EMPTY_MODAL);
          await onSuccess?.("share", doc);
          return;
        }

        await handleRename(doc, value);
        return;
      }

      if (modalState.type === "select") {
        await handleMove(doc, value);
        return;
      }

      if (modalState.confirmText === "Move to Trash") {
        await trashDocument(resolveApiId(doc));
        toast.success("Document moved to trash.");
        setModalState(EMPTY_MODAL);
        await onSuccess?.("trash", doc);
        return;
      }

      if (modalState.confirmText === "Delete permanently") {
        await permanentlyDeleteDocument(resolveApiId(doc));
        toast.success("Document deleted permanently.");
        setModalState(EMPTY_MODAL);
        await onSuccess?.("delete_permanently", doc);
      }
    });
  }

  async function shareWithPeople(doc, shareInput, maybePermission) {
    const candidates = resolveShareIdCandidates(doc);
    if (candidates.length === 0) {
      throw new Error("Cannot share: missing document id.");
    }

    const legacyMode = Array.isArray(shareInput);
    const type = legacyMode ? "EMAIL_INVITE" : shareInput?.type || "EMAIL_INVITE";
    const permission = legacyMode ? maybePermission : shareInput?.permission;
    const normalizedEmails = legacyMode
      ? (shareInput || []).map((email) => String(email || "").trim().toLowerCase()).filter(Boolean)
      : (shareInput?.emails || [])
          .map((email) => String(email || "").trim().toLowerCase())
          .filter(Boolean);
    const expiresAt = legacyMode ? undefined : shareInput?.expiresAt || undefined;

    if (!permission) {
      throw new Error("Share permission is required.");
    }
    if (type === "EMAIL_INVITE" && normalizedEmails.length === 0) {
      throw new Error("At least one recipient email is required.");
    }

    let lastError = null;
    // Retry with fallback ids so sharing works across mixed backend payload shapes.
    for (const candidate of candidates) {
      try {
        let response = null;
        if (type === "PUBLIC") {
          response = await shareDocumentByEmail(candidate, {
            permission,
            type: "PUBLIC",
            ...(expiresAt ? { expiresAt } : {}),
          });
        } else {
          const responses = await Promise.all(
            normalizedEmails.map((email) =>
              shareDocumentByEmail(candidate, {
                permission,
                type: "EMAIL_INVITE",
                email,
                ...(expiresAt ? { expiresAt } : {}),
              }),
            ),
          );
          response = responses[responses.length - 1] ?? null;
        }
        try {
          await onSuccess?.("share", doc);
        } catch {
          // Do not fail a successful share call if list refresh fails.
        }
        return response;
      } catch (error) {
        lastError = error;
        const message = String(error?.message || "");
        if (!/document not found/i.test(message)) {
          throw error;
        }
      }
    }

    throw lastError || new Error("Document not found");
  }

  return useMemo(
    () => ({
      modalState,
      loadingAction,
      handleAction,
      closeModal: () => setModalState(EMPTY_MODAL),
      submitModal,
      shareWithPeople,
    }),
    [modalState, loadingAction],
  );
}
