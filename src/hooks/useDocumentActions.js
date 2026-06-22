import { useMemo, useRef, useState } from "react";
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
import {
  changeDocumentPassword,
  protectDocument,
  removeDocumentProtection,
  resetDocumentProtectionPassword,
  verifyDocumentPassword,
} from "../services/documentProtectionService";
import {
  enrichDocumentProtection,
  extractIsProtectedFromPayload,
  hasValidUnlockSession,
  isDocumentProtected,
  isInvalidPasswordError,
  isSecuredDocument,
  isTeamSpaceMoveDestination,
  setUnlockSession,
  clearUnlockSession,
  withProtectionFlag,
} from "../utils/documentProtection";
import { getUnlockSession } from "../utils/unlockSessionStore";
import {
  TOAST_ACTION_IDS,
  completeActionToast,
  dismissActionToast,
  showActionLoading,
  showSingleToast,
} from "../utils/toastFeedback";

const EMPTY_MODAL = { open: false, type: "confirm", title: "", message: "" };
const EMPTY_VERIFY = { open: false, doc: null, pendingAction: null, error: "" };

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
  const [verifyState, setVerifyState] = useState(EMPTY_VERIFY);
  const [loadingAction, setLoadingAction] = useState(false);
  const protectedIdsRef = useRef(new Set());

  function enrichDoc(doc) {
    const enriched = enrichDocumentProtection(doc, protectedIdsRef.current);
    if (!enriched || enriched.isOwner != null) return enriched;
    // Personal lists often omit owner metadata; align with documentsService default.
    return { ...enriched, isOwner: true };
  }

  function markProtected(doc) {
    const docId = resolveApiId(doc);
    if (docId) protectedIdsRef.current.add(String(docId));
  }

  function clearProtected(doc) {
    const docId = resolveApiId(doc);
    if (docId) protectedIdsRef.current.delete(String(docId));
  }

  function storeUnlockSession(doc, unlockSession) {
    const docId = resolveApiId(doc);
    if (docId && unlockSession) setUnlockSession(docId, unlockSession);
  }

  function isUnlocked(doc) {
    const docId = resolveApiId(doc);
    return Boolean(docId && hasValidUnlockSession(docId));
  }

  function clearUnlocked(doc) {
    const docId = resolveApiId(doc);
    if (docId) clearUnlockSession(docId);
  }

  function getUnlockToken(doc) {
    const docId = resolveApiId(doc);
    if (!docId || !hasValidUnlockSession(docId)) return undefined;
    return getUnlockSession(docId)?.token;
  }

  function openPasswordVerify(doc, pendingAction) {
    setVerifyState({ open: true, doc, pendingAction, error: "" });
  }

  function requiresPasswordUnlock(doc) {
    return isDocumentProtected(enrichDoc(doc)) && !isUnlocked(doc);
  }

  async function runProtectedAction(doc, pendingAction, action) {
    const enriched = enrichDoc(doc);
    if (requiresPasswordUnlock(enriched)) {
      openPasswordVerify(enriched, pendingAction);
      return;
    }
    await action(enriched);
  }

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
      destination = {};
    } else if (
      typeof selectedDestination === "string" &&
      selectedDestination.startsWith("team:")
    ) {
      const teamId = selectedDestination.slice(5).trim();
      if (!teamId) {
        throw new Error("Please select a valid team destination.");
      }
      destination = { teamId };
    } else {
      throw new Error("Please select where to move this document.");
    }

    const docId = resolveApiId(doc);
    const protectedDoc = isDocumentProtected(doc);
    await moveDocument(docId, destination);
    // Move keeps password on the same document row — only clear temporary unlock session.
    clearUnlocked(doc);
    if (protectedDoc) {
      markProtected(doc);
    }
    showSingleToast(
      TOAST_ACTION_IDS.MOVE,
      protectedDoc
        ? "Document moved successfully (protection retained)"
        : "Document moved successfully.",
    );
    setModalState(EMPTY_MODAL);
    await onSuccess?.("move", {
      ...withProtectionFlag(enrichDoc(doc), isDocumentProtected(doc)),
      id: docId,
      teamId: destination.teamId ?? null,
    });
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

  async function runProtectionModalAction(action) {
    setLoadingAction(true);
    try {
      await action();
      return { ok: true };
    } catch (error) {
      const raw = String(error?.message || "");
      const invalidCurrentPassword = isInvalidPasswordError(raw);
      if (!invalidCurrentPassword) {
        toast.error(getActionErrorMessage(error, "Action failed. Please try again."));
      }
      return {
        ok: false,
        invalidCurrentPassword,
        message: invalidCurrentPassword
          ? "Current password is incorrect."
          : getActionErrorMessage(error, "Action failed. Please try again."),
      };
    } finally {
      setLoadingAction(false);
    }
  }

  async function showProtectedTeamMoveBlockedModal(doc) {
    if (isTeamDocument(doc)) {
      toast.info("Password-protected files cannot be moved into a Team Space.");
      return;
    }
    setModalState({
      open: true,
      type: "protected_move_block",
      doc: enrichDoc(doc),
    });
  }

    async function openMoveModal(doc) {
    const enriched = enrichDoc(doc);
    if (isSecuredDocument(enriched) && !isTeamDocument(enriched)) {
      await showProtectedTeamMoveBlockedModal(enriched);
      return;
    }

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
      message: `Choose destination for ${doc.name}.`,
      doc,
      options,
      confirmText: "Move",
    });
  }

  async function enableDocumentProtection(password) {
    const doc = modalState.doc;
    if (!doc) return;
    await runWithGuard(async () => {
      const response = await protectDocument(resolveApiId(doc), password);
      markProtected(doc);
      const protectedFlag = extractIsProtectedFromPayload(response) ?? true;
      toast.success("Password protection enabled.");
      setModalState(EMPTY_MODAL);
      await onSuccess?.("secure_file", withProtectionFlag(doc, protectedFlag));
    });
  }

  async function changeDocumentPasswordHandler({ currentPassword, newPassword }) {
    const doc = modalState.doc;
    if (!doc) return { ok: false, message: "Document not found." };
    if (doc?.isOwner === false) {
      return { ok: false, message: "Only owner can change this password." };
    }
    return runProtectionModalAction(async () => {
      await changeDocumentPassword(resolveApiId(doc), currentPassword, newPassword);
      markProtected(doc);
      clearUnlocked(doc);
      setModalState((prev) => ({
        ...prev,
        doc: withProtectionFlag(enrichDoc(doc), true),
      }));
      toast.success("Password updated successfully.");
      await onSuccess?.("secure_file", withProtectionFlag(doc, true));
    });
  }

  async function removeDocumentProtectionHandler(currentPassword) {
    const doc = modalState.doc;
    if (!doc) return { ok: false, message: "Document not found." };
    if (doc?.isOwner === false) {
      return { ok: false, message: "Only owner can remove protection." };
    }
    return runProtectionModalAction(async () => {
      await verifyDocumentPassword(resolveApiId(doc), currentPassword);
      await removeDocumentProtection(resolveApiId(doc));
      clearProtected(doc);
      clearUnlocked(doc);
      toast.success("Password protection removed.");
      setModalState(EMPTY_MODAL);
      await onSuccess?.("secure_file", withProtectionFlag(doc, false));
    });
  }

  async function resetDocumentPasswordHandler({ newPassword }) {
    const doc = modalState.doc;
    if (!doc) return { ok: false, message: "Document not found." };
    if (doc?.isOwner === false) {
      toast.warning("Only owner can reset this document password.");
      return { ok: false, message: "Only owner can reset this document password." };
    }
    return runProtectionModalAction(async () => {
      await resetDocumentProtectionPassword(resolveApiId(doc), newPassword);
      markProtected(doc);
      clearUnlocked(doc);
      setModalState(EMPTY_MODAL);
      toast.success("Password reset successfully.");
      await onSuccess?.("secure_file", withProtectionFlag(doc, true));
    });
  }

  async function submitVerifyPassword(password) {
    const doc = verifyState.doc;
    const pendingAction = verifyState.pendingAction;
    if (!doc) return;

    setLoadingAction(true);
    try {
      const { unlockSession } = await verifyDocumentPassword(resolveApiId(doc), password);
      storeUnlockSession(doc, unlockSession);
      setVerifyState(EMPTY_VERIFY);

      if (pendingAction === "download") {
        toast.success("Document unlocked. Download starting...");
        await downloadDocument(resolveApiId(doc), doc.name, {
          unlockToken: unlockSession?.token,
        });
        return;
      }

      if (pendingAction === "preview") {
        toast.success("Document unlocked for 15 minutes.");
        await onSuccess?.("preview", doc);
      }
    } catch (error) {
      const raw = String(error?.message || "");
      const invalidPassword = isInvalidPasswordError(raw);
      const message = invalidPassword
        ? "Invalid password."
        : getActionErrorMessage(error, "Unable to verify password.");
      if (!invalidPassword) {
        toast.error(message);
      }
      setVerifyState((prev) => ({ ...prev, error: message }));
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleAction(actionKey, doc) {
    // Preview is handled by page-level callback to keep this hook reusable.
    if (actionKey === "preview") {
      await runProtectedAction(doc, "preview", async () => {
        await onSuccess?.("preview", doc);
      });
      return;
    }

    const restrictedForNonOwner = new Set([
      "rename",
      "move",
      "duplicate",
      "trash",
      "delete_permanently",
      "restore",
      "share",
      "secure_file",
    ]);
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
        message: `Manage access for ${doc.name}.`,
        doc,
      });
      return;
    }

    if (actionKey === "secure_file") {
      if (isTeamDocument(doc)) {
        toast.info("Password protection is not available for team documents.");
        return;
      }
      setModalState({
        open: true,
        type: "secure_file",
        title: "Secure file",
        doc: enrichDoc(doc),
      });
      return;
    }

    if (actionKey === "move") {
      await openMoveModal(doc);
      return;
    }

    if (actionKey === "version_history") {
      setModalState({
        open: true,
        type: "version_history",
        doc: enrichDoc(doc),
      });
      return;
    }

    if (actionKey === "duplicate") {
      const actionId = TOAST_ACTION_IDS.DUPLICATE;
      setLoadingAction(true);
      showActionLoading(actionId, "Duplicating document…");
      try {
        const protectedDoc = isDocumentProtected(doc);
        await duplicateDocument(resolveApiId(doc));
        completeActionToast(
          actionId,
          protectedDoc
            ? "Document duplicated. Protection is retained."
            : "Document duplicated successfully.",
        );
        await onSuccess?.("duplicate", doc);
      } catch (error) {
        dismissActionToast(actionId);
        toast.error(getActionErrorMessage(error, "Unable to duplicate document."));
      } finally {
        setLoadingAction(false);
      }
      return;
    }

    if (actionKey === "download") {
      await runProtectedAction(doc, "download", async (enrichedDoc) => {
        await runWithGuard(async () => {
          await downloadDocument(resolveApiId(enrichedDoc), enrichedDoc.name, {
            unlockToken: getUnlockToken(enrichedDoc),
          });
          toast.success("Download started.");
        });
      });
      return;
    }

    if (actionKey === "trash") {
      setModalState({
        open: true,
        type: "confirm",
        title: "Move to Trash?",
        message: `${doc.name} will be moved to the recycle bin and can be restored later.`,
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

    if (modalState.type === "protected_move_block") {
      setModalState({
        open: true,
        type: "secure_file",
        title: "Secure file",
        doc: enrichDoc(doc),
      });
      return;
    }

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
          showSingleToast(TOAST_ACTION_IDS.SHARE, "Document shared successfully.");
          setModalState(EMPTY_MODAL);
          await onSuccess?.("share", doc);
          return;
        }

        await handleRename(doc, value);
        return;
      }

      if (modalState.type === "select") {
        const enriched = enrichDoc(doc);
        if (isSecuredDocument(enriched) && isTeamSpaceMoveDestination(value)) {
          await showProtectedTeamMoveBlockedModal(enriched);
          return;
        }
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
      verifyState,
      loadingAction,
      handleAction,
      closeModal: () => setModalState(EMPTY_MODAL),
      closeVerifyModal: () => setVerifyState(EMPTY_VERIFY),
      submitModal,
      shareWithPeople,
      enableDocumentProtection,
      changeDocumentPassword: changeDocumentPasswordHandler,
      removeDocumentProtection: removeDocumentProtectionHandler,
      resetDocumentPassword: resetDocumentPasswordHandler,
      submitVerifyPassword,
    }),
    [modalState, verifyState, loadingAction],
  );
}
