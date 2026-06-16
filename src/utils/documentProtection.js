import {
  createUnlockSession,
  getUnlockSession,
  hasValidUnlockSession,
  setUnlockSession,
  clearUnlockSession,
  UNLOCK_SESSION_TTL_MS,
} from "./unlockSessionStore.js";

export { UNLOCK_SESSION_TTL_MS, setUnlockSession, getUnlockSession, clearUnlockSession, hasValidUnlockSession };

function readProtectedFlag(value) {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return Boolean(value);
}

export function resolveDocumentId(doc) {
  if (!doc) return null;
  return doc.apiId || doc.documentId || doc.fileId || doc.id || null;
}

export function isDocumentProtected(doc) {
  if (!doc) return false;
  const candidates = [doc, doc.document, doc.file, doc.data].filter(Boolean);
  return candidates.some((item) =>
    readProtectedFlag(
      item.isProtected ??
        item.protected ??
        item.passwordProtected ??
        item.hasPassword ??
        item.isPasswordProtected ??
        item.secured,
    ),
  );
}

export function isSecuredDocument(doc) {
  if (!doc) return false;
  if (doc.secured === true) return true;
  return isDocumentProtected(doc);
}

export function isTeamSpaceMoveDestination(destination) {
  return typeof destination === "string" && destination.startsWith("team:");
}

export function extractIsProtectedFromPayload(payload) {
  const root = payload?.data ?? payload;
  if (!root) return null;
  if (isDocumentProtected(root)) return true;
  if (
    root.isProtected === false ||
    root.protected === false ||
    root.passwordProtected === false ||
    root.secured === false
  ) {
    return false;
  }
  return null;
}

export function parseUnlockSessionFromResponse(payload) {
  const root = payload?.data ?? payload ?? {};
  return createUnlockSession({
    unlockToken: root.unlockToken ?? root.verificationToken ?? root.accessToken,
    expiresAt: root.expiresAt ?? root.expiresAtMs,
  });
}

export function withProtectionFlag(doc, isProtected) {
  if (!doc) return doc;
  return { ...doc, isProtected: Boolean(isProtected) };
}

export function enrichDocumentProtection(doc, protectedIdSet) {
  if (!doc) return doc;
  const id = resolveDocumentId(doc);
  const fromSet = id && protectedIdSet?.has?.(String(id));
  return withProtectionFlag(doc, isDocumentProtected(doc) || Boolean(fromSet));
}

export function getProtectionStatus(doc) {
  const documentId = resolveDocumentId(doc);
  const isProtected = isDocumentProtected(doc);
  const isUnlocked = documentId ? hasValidUnlockSession(documentId) : false;
  return {
    documentId,
    isProtected,
    isUnlocked,
    isLocked: isProtected && !isUnlocked,
  };
}

export function isInvalidPasswordError(message) {
  const raw = String(message || "").trim();
  if (!raw) return false;
  if (/unable to verify|endpoint is missing|request failed \(404\)|not found|authorization or share/i.test(raw)) {
    return false;
  }
  return /invalid|incorrect|wrong|mismatch|bad credentials|can't validate|cannot validate|password is required/i.test(
    raw,
  );
}

export const ENTERPRISE_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export const PASSWORD_REQUIREMENTS = [
  {
    id: "uppercase",
    label: "Contains uppercase letter",
    test: (value) => /[A-Z]/.test(value),
    errorMessage: "Password must contain at least one uppercase letter.",
  },
  {
    id: "lowercase",
    label: "Contains lowercase letter",
    test: (value) => /[a-z]/.test(value),
    errorMessage: "Password must contain at least one lowercase letter.",
  },
  {
    id: "number",
    label: "Contains number",
    test: (value) => /\d/.test(value),
    errorMessage: "Password must contain at least one number.",
  },
  {
    id: "special",
    label: "Contains special character",
    test: (value) => /[@$!%*?&]/.test(value),
    errorMessage: "Password must contain at least one special character.",
  },
  {
    id: "minLength",
    label: "Minimum 8 characters",
    test: (value) => value.length >= 8,
    errorMessage: "Password must be at least 8 characters long.",
  },
];

export function getPasswordRequirementStatus(password) {
  const value = String(password || "");
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    ...requirement,
    met: requirement.test(value),
  }));
}

export function getFirstPasswordValidationError(password) {
  const trimmed = String(password || "").trim();
  if (!trimmed) return "Password is required.";
  const missing = PASSWORD_REQUIREMENTS.find((requirement) => !requirement.test(trimmed));
  return missing?.errorMessage ?? null;
}

export function validateCurrentPasswordInput(password) {
  const trimmed = String(password || "").trim();
  if (!trimmed) return { valid: false, message: "Password is required." };
  return { valid: true, value: trimmed };
}

export function validateDocumentPasswordInput(password) {
  const trimmed = String(password || "").trim();
  if (!trimmed) return { valid: false, message: "Password is required." };
  const firstError = getFirstPasswordValidationError(trimmed);
  if (firstError) return { valid: false, message: firstError };
  if (!ENTERPRISE_PASSWORD_REGEX.test(trimmed)) {
    return { valid: false, message: getFirstPasswordValidationError(trimmed) || "Invalid password." };
  }
  return { valid: true, value: trimmed };
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  // Current password can be legacy; only require non-empty.
  const current = validateCurrentPasswordInput(currentPassword);
  if (!current.valid) return current;

  const next = validateDocumentPasswordInput(newPassword);
  if (!next.valid) return next;

  if (next.value === current.value) {
    return { valid: false, message: "New password must be different from the current password." };
  }

  if (String(confirmPassword || "").trim() !== next.value) {
    return { valid: false, message: "Passwords do not match." };
  }

  return { valid: true, currentPassword: current.value, newPassword: next.value };
}

export function getPasswordStrength(password) {
  const value = String(password || "");
  if (!value) return { score: 0, label: "" };
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[@$!%*?&]/.test(value);
  const hasMinLen = value.length >= 8;
  const met = [hasLower, hasUpper, hasNumber, hasSpecial, hasMinLen].filter(Boolean).length;

  if (met <= 2) return { score: met, label: "Weak", color: "text-rose-600" };
  if (met <= 4) return { score: met, label: "Medium", color: "text-amber-600" };
  return { score: met, label: "Strong", color: "text-emerald-600" };
}
