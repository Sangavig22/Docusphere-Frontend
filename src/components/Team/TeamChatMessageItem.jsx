import { ReceiptTicks, resolveDocumentOwnerId, resolveMessageDocumentLabel, resolveDocumentLabel, formatTime } from "./teamChatUtils.jsx";

const formatContent = (text, isSelf) =>
  text?.split(/(@[\w.]+)/g).map((part, i) =>
    /^@[\w.]+$/.test(part) ? (
      <span key={i} className={isSelf ? "font-semibold text-amber-200" : "font-semibold text-blue-600 dark:text-blue-300"}>
        {part}
      </span>
    ) : (
      part
    )
  );

export default function TeamChatMessageItem({
  message,
  index,
  firstUnreadIndex,
  currentUserId,
  members,
  documents,
  canManageAllTeamDocs,
  onContextMenu,
  onOpenDocument,
}) {
  const isSelf = Number(message.senderId) === currentUserId;
  const isMentioned = Array.isArray(message.mentionUserIds)
    ? message.mentionUserIds.map(Number).includes(currentUserId)
    : false;
  const messageDocumentId = message.documentId != null ? String(message.documentId) : "";
  const linkedDocument = Array.isArray(documents)
    ? documents.find((doc) => String(doc?.id ?? doc?.documentId ?? doc?._id) === messageDocumentId)
    : null;
  const documentOwnerId = resolveDocumentOwnerId(linkedDocument);
  const canOpenDocument = Boolean(messageDocumentId) && (
    canManageAllTeamDocs ||
    linkedDocument?.isOwner === true ||
    (documentOwnerId && String(documentOwnerId) === String(currentUserId))
  );
  const documentLabel = resolveMessageDocumentLabel(linkedDocument, message) || resolveDocumentLabel(linkedDocument);

  return (
    <div>
      {index === firstUnreadIndex && firstUnreadIndex !== -1 && (
        <div className="my-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>New messages</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      <article
        data-chat-message
        data-msg-id={message.id}
        data-sender-id={message.senderId}
        onContextMenu={(event) => onContextMenu(event, message)}
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm cursor-context-menu ${
          isSelf
            ? "ml-auto bg-blue-600 text-white"
            : isMentioned
              ? "border border-amber-300 bg-amber-50 text-slate-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-text"
              : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-text"
        }`}
      >
        <div className="mb-1 flex items-center justify-between gap-3 text-xs">
          <span className={`font-semibold ${isSelf ? "text-blue-100" : "text-muted dark:text-slate-300"}`}>
            {isSelf ? "You" : message.senderName}
          </span>
          <span className={isSelf ? "text-blue-100" : "text-muted"}>{formatTime(message.createdAt)}</span>
        </div>

        <p className="whitespace-pre-wrap break-words">{formatContent(message.content, isSelf)}</p>
        {messageDocumentId && (
          <div className={`mt-2 flex flex-wrap items-center gap-2 text-xs ${isSelf ? "text-blue-50" : "text-slate-500"}`}>
            <span className={isSelf ? "text-blue-100/80" : "text-slate-400"}>Document</span>
            {canOpenDocument ? (
              <button
                type="button"
                onClick={() => onOpenDocument(messageDocumentId)}
                className={`font-medium underline decoration-current underline-offset-2 transition-colors ${
                  isSelf ? "text-blue-50 hover:text-white" : "text-sky-700 hover:text-sky-800"
                }`}
              >
                {documentLabel}
              </button>
            ) : (
              <span
                title="Only the team leader, manager, and document owner can open this document"
                className={`font-medium ${isSelf ? "text-blue-50/80" : "text-slate-700"}`}
              >
                {documentLabel}
              </span>
            )}
          </div>
        )}
        {message.isEdited && (
          <p className={`mt-1 text-xs italic ${isSelf ? "text-blue-100" : "text-slate-500"}`}>
            (edited)
          </p>
        )}
        {isSelf ? (
          <p className="mt-1 flex justify-end text-[10px] text-blue-100/90">
            <ReceiptTicks
              deliveredTo={message.deliveredTo}
              seenBy={message.seenBy}
              currentUserId={currentUserId}
              members={members}
            />
          </p>
        ) : null}
      </article>
    </div>
  );
}
