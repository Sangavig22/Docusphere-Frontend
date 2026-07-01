import { Check, CheckCheck } from "lucide-react";

export const resolveDocumentOwnerId = (doc) => {
  const candidates = [
    doc?.ownerId,
    doc?.ownerUserId,
    doc?.uploadedById,
    doc?.createdById,
    doc?.creatorId,
    doc?.userId,
    doc?.createdBy?.id,
    doc?.createdBy?.userId,
    doc?.uploadedBy?.id,
    doc?.uploadedBy?.userId,
  ];

  for (const candidate of candidates) {
    const value = candidate == null ? "" : String(candidate).trim();
    if (value) return value;
  }

  return "";
};

export const resolveDocumentLabel = (doc) => {
  if (!doc) return "Document";

  return (
    doc.name ||
    doc.fileName ||
    doc.title ||
    doc.documentName ||
    doc.documentTitle ||
    `Document ${String(doc.id ?? doc.documentId ?? "").slice(0, 8)}`
  );
};

export const resolveMessageDocumentLabel = (doc, message) => {
  const explicitLabel =
    message?.documentName ||
    message?.documentTitle ||
    message?.documentLabel ||
    message?.documentFileName;

  if (typeof explicitLabel === "string" && explicitLabel.trim()) {
    return explicitLabel.trim();
  }

  return resolveDocumentLabel(doc);
};

export function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const addStringIdToSet = (prev, value) => {
  const id = String(value);
  if (prev.has(id)) return prev;
  const next = new Set(prev);
  next.add(id);
  return next;
};

export const removeStringIdFromSet = (prev, value) => {
  const id = String(value);
  if (!prev.has(id)) return prev;
  const next = new Set(prev);
  next.delete(id);
  return next;
};

export const resetSetIfNeeded = (prev) => (prev.size === 0 ? prev : new Set());

export const addUniqueNumber = (values, nextValue) => {
  const normalizedValues = Array.isArray(values) ? values.map(Number) : [];
  return Array.from(new Set([...normalizedValues, Number(nextValue)]));
};

export const mergeReceiptFields = (currentMessage, nextMessage) => {
  const current = getReceiptLists(currentMessage);
  const next = getReceiptLists(nextMessage);

  return {
    ...(currentMessage || {}),
    ...(nextMessage || {}),
    deliveredTo: next.deliveredTo.length > 0 ? next.deliveredTo : current.deliveredTo,
    seenBy: next.seenBy.length > 0 ? next.seenBy : current.seenBy,
  };
};

export function getReceiptLists(source) {
  const delivered = source?.deliveredTo ?? source?.delivered_to ?? [];
  const seen = source?.seenBy ?? source?.seen_by ?? [];

  return {
    deliveredTo: Array.isArray(delivered) ? delivered.map(Number).filter(Number.isFinite) : [],
    seenBy: Array.isArray(seen) ? seen.map(Number).filter(Number.isFinite) : [],
  };
}

export const resolveMemberUserId = (member) => {
  const raw = member?.userId ?? member?.user?.id ?? member?.user?.userId;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

export const countActiveRecipients = (members, senderUserId) => {
  if (!Array.isArray(members)) return 0;

  return members.filter((member) => {
    const memberUserId = resolveMemberUserId(member);
    if (memberUserId == null || memberUserId === senderUserId) return false;
    return member?.active !== false;
  }).length;
};

export const excludeSenderReceiptIds = (ids, senderUserId) =>
  (Array.isArray(ids) ? ids : [])
    .map(Number)
    .filter((id) => Number.isFinite(id) && id !== senderUserId);

export const updateMessageById = (messages, messageId, updater) => {
  const targetId = String(messageId);
  return messages.map((message) => (String(message.id) === targetId ? updater(message) : message));
};

export const removeMessageById = (messages, messageId) => {
  const targetId = String(messageId);
  return messages.filter((message) => String(message.id) !== targetId);
};

export const deriveUnreadMessageIds = (messages, currentUserId, isActive) => {
  if (isActive || !Array.isArray(messages)) return new Set();

  return new Set(
    messages
      .filter((message) => Number(message.senderId) !== currentUserId)
      .filter((message) => !String(message.id).startsWith("temp-"))
      .filter((message) => {
        const { seenBy } = getReceiptLists(message);
        return !seenBy.includes(currentUserId);
      })
      .map((message) => String(message.id))
  );
};

export const deriveMentionMessageIds = (messages, currentUserId, isActive) => {
  if (isActive || !Array.isArray(messages)) return new Set();

  return new Set(
    messages
      .filter((message) => Number(message.senderId) !== currentUserId)
      .filter((message) => !String(message.id).startsWith("temp-"))
      .filter((message) => {
        const mentionIds = Array.isArray(message.mentionUserIds) ? message.mentionUserIds.map(Number) : [];
        const { seenBy } = getReceiptLists(message);
        return mentionIds.includes(currentUserId) && !seenBy.includes(currentUserId);
      })
      .map((message) => String(message.id))
  );
};

/** WebSocket payload when a message was deleted (see DeleteMessageEvent). */
export function isDeleteMessageEvent(body) {
  return (
    body &&
    body.messageId != null &&
    typeof body.scope === "string" &&
    body.senderId == null &&
    body.content == null
  );
}

export function isReceiptBatchEvent(body) {
  return body && body.type === "RECEIPT_BATCH" && Array.isArray(body.updates);
}

export function isSingleReceiptUpdate(body) {
  if (!body || body.type === "RECEIPT_BATCH" || body.content != null || body.scope != null) {
    return false;
  }

  const messageId = body.messageId ?? body.message_id;
  if (messageId == null) return false;

  return (
    body.deliveredTo != null ||
    body.delivered_to != null ||
    body.seenBy != null ||
    body.seen_by != null
  );
}

export function applyReceiptUpdates(prev, updates) {
  if (!Array.isArray(updates) || updates.length === 0) return prev;

  const byId = new Map(
    updates.map((update) => [String(update.messageId ?? update.message_id), update])
  );

  return prev.map((message) => {
    const update = byId.get(String(message.id));
    if (!update) return message;

    const nextReceipts = getReceiptLists(update);
    const currentReceipts = getReceiptLists(message);

    return {
      ...message,
      deliveredTo:
        nextReceipts.deliveredTo.length > 0 ? nextReceipts.deliveredTo : currentReceipts.deliveredTo,
      seenBy: nextReceipts.seenBy.length > 0 ? nextReceipts.seenBy : currentReceipts.seenBy,
    };
  });
}

export function ReceiptTicks({ deliveredTo, seenBy, currentUserId, members }) {
  const senderUserId = Number(currentUserId);
  const teamCount = countActiveRecipients(members, senderUserId);

  const deliveredIds = excludeSenderReceiptIds(deliveredTo, senderUserId);
  const seenIds = excludeSenderReceiptIds(seenBy, senderUserId);

  const deliveredCount = deliveredIds.length;
  const seenCount = seenIds.length;
  const hasAnyReceipt = deliveredCount > 0 || seenCount > 0;

  // Sent only — no other member has received or read yet
  if (!hasAnyReceipt) {
    return (
      <span className="inline-flex items-center text-slate-200">
        <Check size={14} />
      </span>
    );
  }

  const effectiveTeamCount = Math.max(teamCount, 1);
  const allSeen = seenCount >= effectiveTeamCount;
  const allDelivered = deliveredCount >= effectiveTeamCount;
  const anySeen = seenCount > 0;

  // Blue double tick — read by everyone (or by the only recipient in 1:1)
  if (allSeen || (effectiveTeamCount === 1 && anySeen)) {
    return (
      <span className="inline-flex items-center text-blue-400">
        <CheckCheck size={14} strokeWidth={2.5} />
      </span>
    );
  }

  // Grey double tick — delivered to everyone, or at least one recipient got it
  if (allDelivered || hasAnyReceipt) {
    return (
      <span className="inline-flex items-center text-slate-200">
        <CheckCheck size={14} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-slate-200">
      <Check size={14} />
    </span>
  );
}

export function smartMergeMessages(existingMessages, incomingMessage) {
  const pendingIndex = existingMessages.findIndex(
    (msg) =>
      msg.isPending &&
      msg.senderId === incomingMessage.senderId &&
      msg.content === incomingMessage.content &&
      msg.messageType === incomingMessage.messageType &&
      String(msg.id).startsWith("temp-")
  );

  if (pendingIndex !== -1) {
    const updated = [...existingMessages];
    updated[pendingIndex] = incomingMessage;
    return updated;
  }

  if (existingMessages.some((msg) => msg.id === incomingMessage.id)) return existingMessages;

  return [...existingMessages, incomingMessage];
}