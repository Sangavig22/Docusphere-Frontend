import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Wifi, WifiOff } from "lucide-react";

import authService from "../../services/authService";
import { teamsApi } from "../../services/teamsApi";
import { chatService } from "../../services/chatService";
import MessageContextMenu from "./MessageContextMenu";
import MessageInfoModal from "./MessageInfoModal";
import TeamChatMessageItem from "./TeamChatMessageItem";
import {
  addStringIdToSet,
  addUniqueNumber,
  applyReceiptUpdates,
  deriveMentionMessageIds,
  deriveUnreadMessageIds,
  getReceiptLists,
  isDeleteMessageEvent,
  isReceiptBatchEvent,
  isSingleReceiptUpdate,
  mergeReceiptFields,
  removeMessageById,
  removeStringIdFromSet,
  resetSetIfNeeded,
  smartMergeMessages,
  updateMessageById,
} from "./teamChatUtils.jsx";

const MAX_MESSAGES = 200;

const highlightDraftMentions = (text) =>
  text?.split(/(@[\w.]+)/g).map((part, i) =>
    /^@[\w.]+$/.test(part) ? (
      <span key={i} className="font-semibold text-amber-400">
        {part}
      </span>
    ) : (
      part
    )
  );

export default function TeamChat({
  teamId,
  members,
  documents,
  isActive = false,
  canManageAllTeamDocs = false,
  onOpenDocument,
  onUnreadCountChange,
  onMentionCountChange,
  onMemberBlockStatusChange,
}) {
  const currentUserId = Number(authService.getUserId());
  const currentUserMember = useMemo(
    () => (Array.isArray(members) ? members.find((member) => String(member.userId ?? member.id) === String(currentUserId)) : null),
    [members, currentUserId]
  );
  const isChatBlocked = currentUserMember?.active === false;
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [draft, setDraft] = useState("");
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [messageType, setMessageType] = useState("TEXT");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState("");
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [selectedContextMessage, setSelectedContextMessage] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [infoModalMessage, setInfoModalMessage] = useState(null);
  const [infoModalMessageId, setInfoModalMessageId] = useState(null);
  const [newMessageIds, setNewMessageIds] = useState(() => new Set());
  const [mentionMessageIds, setMentionMessageIds] = useState(() => new Set());
  const [receiptSnapshots, setReceiptSnapshots] = useState({});

  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const historyDeliveredRef = useRef(false);
  const deliveredAckRef = useRef(new Set());
  const seenAckRef = useRef(new Set());
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const mentionCandidates = useMemo(() => {
    if (!Array.isArray(members)) return [];

    const normalized = mentionQuery.trim().toLowerCase();
    return members
      .filter((member) => Number(member.userId ?? member.id) !== currentUserId)
      .filter((member) => {
        if (!normalized) return true;
        const fullName = String(member.fullName ?? "").toLowerCase();
        const email = String(member.email ?? "").toLowerCase();
        return fullName.includes(normalized) || email.includes(normalized);
      })
      .slice(0, 6);
  }, [members, mentionQuery, currentUserId]);

  useEffect(() => {
    historyDeliveredRef.current = false;
    deliveredAckRef.current = new Set();
    seenAckRef.current = new Set();
    setNewMessageIds(new Set());
    setMentionMessageIds(new Set());
    setReceiptSnapshots({});
  }, [teamId]);

  useEffect(() => {
    if (typeof onUnreadCountChange === "function") {
      onUnreadCountChange(newMessageIds.size);
    }
  }, [newMessageIds, onUnreadCountChange]);

  useEffect(() => {
    if (typeof onMentionCountChange === "function") {
      onMentionCountChange(mentionMessageIds.size);
    }
  }, [mentionMessageIds, onMentionCountChange]);

  useEffect(() => {
    if (!isActive) return;
    setNewMessageIds(resetSetIfNeeded);
    setMentionMessageIds(resetSetIfNeeded);
  }, [isActive]);

  useEffect(() => {
    if (!isChatBlocked) return;

    setMessages([]);
    setLoadingHistory(false);
    setSocketConnected(false);
    setError("");
    socketRef.current?.disconnect?.();
    socketRef.current = null;
    onUnreadCountChange?.(0);
    onMentionCountChange?.(0);
  }, [isChatBlocked, onMentionCountChange, onUnreadCountChange]);

  useEffect(() => {
    let mounted = true;

    if (isChatBlocked) {
      return () => {
        mounted = false;
      };
    }

    const setup = async () => {
      try {
        setLoadingHistory(true);
        const history = await chatService.getHistory(teamId, 50);
        if (!mounted) return;
        setMessages(Array.isArray(history) ? history : []);
      } catch (historyError) {
        if (!mounted) return;
        setError(historyError.message || "Failed to load chat history");
      } finally {
        if (mounted) setLoadingHistory(false);
      }

      try {
        socketRef.current = chatService.connect(teamId, {
          onConnected: () => {
            setSocketConnected(true);
            setError("");
          },
          onError: (socketError) => {
            setSocketConnected(false);
            setError(socketError.message || "Realtime connection unavailable");
          },
          onMessage: (incoming) => {
            if (incoming && incoming.type === "CHAT_BLOCK_UPDATE") {
              const blockedUserId = Number(incoming.userId);
              const isBlocked = incoming.blocked;
              if (typeof onMemberBlockStatusChange === "function") {
                onMemberBlockStatusChange(blockedUserId, isBlocked);
              }
              return;
            }

            if (isDeleteMessageEvent(incoming)) {
              const mid = incoming.messageId;
              const scope = incoming.scope;
              const deletedBy = Number(incoming.deletedBy);
              setMessages((prev) => {
                if (scope === "for-everyone") {
                  return prev.filter((m) => String(m.id) !== String(mid));
                }
                if (scope === "for-me" && deletedBy === currentUserId) {
                  return prev.filter((m) => String(m.id) !== String(mid));
                }
                return prev;
              });
              return;
            }

            if (isReceiptBatchEvent(incoming)) {
              updateReceiptSnapshots(incoming.updates);
              setMessages((prev) => {
                const next = applyReceiptUpdates(prev, incoming.updates);
                if (infoModalMessageId) {
                  const liveMessage = next.find((m) => String(m.id) === String(infoModalMessageId));
                  if (liveMessage) {
                    setInfoModalMessage(liveMessage);
                  }
                }
                return next;
              });
              return;
            }

            if (isSingleReceiptUpdate(incoming)) {
              updateReceiptSnapshots([incoming]);
              setMessages((prev) => applyReceiptUpdates(prev, [incoming]));
              return;
            }

            const isIncomingFromOther =
              incoming.senderId != null &&
              Number(incoming.senderId) !== currentUserId &&
              incoming.id != null &&
              !String(incoming.id).startsWith("temp-");

            const incomingMentionsCurrentUser =
              Array.isArray(incoming.mentionUserIds) &&
              incoming.mentionUserIds.map(Number).includes(currentUserId);

            if (isIncomingFromOther && !isActiveRef.current) {
              const incomingId = String(incoming.id);
              setNewMessageIds((prev) => addStringIdToSet(prev, incomingId));
              if (incomingMentionsCurrentUser) {
                setMentionMessageIds((prev) => addStringIdToSet(prev, incomingId));
              }
            }

            setMessages((prev) => {
              const idx = prev.findIndex((m) => String(m.id) === String(incoming.id));
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...incoming, isPending: false };
                return next.slice(-MAX_MESSAGES);
              }
              const merged = smartMergeMessages([...prev], incoming);
              return merged.slice(-MAX_MESSAGES);
            });

          },
        });
      } catch (connectError) {
        setSocketConnected(false);
        setError(connectError.message || "Realtime connection unavailable");
      }
    };

    setup();

    return () => {
      mounted = false;
      socketRef.current?.disconnect?.();
      socketRef.current = null;
    };
  }, [teamId, currentUserId, isChatBlocked]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const updateReceiptSnapshots = (updates) => {
    if (!Array.isArray(updates) || updates.length === 0) return;
    setReceiptSnapshots((prev) => {
      const next = { ...prev };
      for (const update of updates) {
        const messageId = update?.messageId ?? update?.message_id;
        if (!messageId) continue;
        const lists = getReceiptLists(update);
        next[String(messageId)] = {
          deliveredTo: lists.deliveredTo,
          seenBy: lists.seenBy,
        };
      }
      return next;
    });
  };

  const mergeLiveMessageReceipts = (message) => {
    const snapshot = receiptSnapshots[String(message.id)];
    const current = getReceiptLists(message);

    if (!snapshot) {
      return { ...message, deliveredTo: current.deliveredTo, seenBy: current.seenBy };
    }

    const snapshotReceipts = getReceiptLists(snapshot);

    return {
      ...message,
      deliveredTo:
        snapshotReceipts.deliveredTo.length > 0 ? snapshotReceipts.deliveredTo : current.deliveredTo,
      seenBy: snapshotReceipts.seenBy.length > 0 ? snapshotReceipts.seenBy : current.seenBy,
    };
  };

  const displayMessages = useMemo(
    () => messages.map((message) => mergeLiveMessageReceipts(message)),
    [messages, receiptSnapshots]
  );

  useEffect(() => {
    if (loadingHistory) return;

    setNewMessageIds(deriveUnreadMessageIds(displayMessages, currentUserId, isActive));
    setMentionMessageIds(deriveMentionMessageIds(displayMessages, currentUserId, isActive));
  }, [displayMessages, currentUserId, isActive, loadingHistory]);

  useEffect(() => {
    if (loadingHistory) return;

    const receiptsToSend = displayMessages
      .filter((message) => Number(message.senderId) !== currentUserId)
      .filter((message) => !String(message.id).startsWith("temp-"))
      .filter((message) => {
        const messageId = String(message.id);
        const { deliveredTo } = getReceiptLists(message);
        return !deliveredTo.includes(currentUserId) && !deliveredAckRef.current.has(messageId);
      });

    if (receiptsToSend.length === 0) return;

    receiptsToSend.forEach((message) => {
      const messageId = String(message.id);
      deliveredAckRef.current.add(messageId);
      void Promise.resolve(socketRef.current?.sendReceipt?.(message.id, "DELIVERED")).catch(() => {
        deliveredAckRef.current.delete(messageId);
      });
    });
  }, [displayMessages, loadingHistory, currentUserId]);

  useEffect(() => {
    if (!isActive || loadingHistory) return;

    displayMessages
      .filter((message) => Number(message.senderId) !== currentUserId)
      .filter((message) => !String(message.id).startsWith("temp-"))
      .forEach((message) => {
        const messageId = String(message.id);
        const { seenBy } = getReceiptLists(message);
        if (seenBy.includes(currentUserId) || seenAckRef.current.has(messageId)) return;

        seenAckRef.current.add(messageId);
        setNewMessageIds((prev) => removeStringIdFromSet(prev, messageId));
        setMentionMessageIds((prev) => removeStringIdFromSet(prev, messageId));
        void Promise.resolve(socketRef.current?.sendReceipt?.(message.id, "SEEN")).catch(() => {
          seenAckRef.current.delete(messageId);
        });
      });
  }, [isActive, displayMessages, loadingHistory, currentUserId]);

  useEffect(() => {
    if (!infoModalMessageId) return;
    const liveMessage = displayMessages.find((m) => String(m.id) === String(infoModalMessageId));
    if (liveMessage) {
      setInfoModalMessage(liveMessage);
    }
  }, [displayMessages, infoModalMessageId]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || loadingHistory) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
          const el = entry.target;
          const id = el.getAttribute("data-msg-id");
          const sid = Number(el.getAttribute("data-sender-id"));
          if (!id || String(id).startsWith("temp-")) return;
          if (sid === currentUserId) return;
          if (seenAckRef.current.has(id)) return;
          seenAckRef.current.add(id);
          setNewMessageIds((prev) => removeStringIdFromSet(prev, id));
          setMentionMessageIds((prev) => removeStringIdFromSet(prev, id));
          void Promise.resolve(socketRef.current?.sendReceipt?.(id, "SEEN")).catch(() => {
            seenAckRef.current.delete(id);
          });
        });
      },
      { root: container, threshold: [0, 0.35, 0.55] }
    );

    container.querySelectorAll("[data-chat-message]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [messages, loadingHistory, currentUserId]);

  const onDraftChange = (value) => {
    setDraft(value);

    const mentionMatch = value.match(/(?:^|\s)@([\w.]*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1] || "");
      setShowMentionMenu(true);
      return;
    }

    setShowMentionMenu(false);
    setMentionQuery("");
  };

  const addMention = (member) => {
    const memberName = member.fullName || member.email || "user";
    const memberId = Number(member.userId ?? member.id);

    setDraft((prev) => prev.replace(/(?:^|\s)@[\w.]*$/, ` @${memberName.replace(/\s+/g, "_")} `));
    setSelectedMentions((prev) => (prev.includes(memberId) ? prev : [...prev, memberId]));
    setShowMentionMenu(false);
    setMentionQuery("");
  };

  const clearComposer = () => {
    setDraft("");
    setSelectedMentions([]);
    setMessageType("TEXT");
    setSelectedDocumentId("");
    setShowMentionMenu(false);
    setMentionQuery("");
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content) return;

    if (messageType === "CHANGE_REQUEST" && !selectedDocumentId) {
      setError("Select a document for change request messages.");
      return;
    }

    const payload = {
      content,
      messageType,
      documentId: messageType === "CHANGE_REQUEST" ? selectedDocumentId : null,
      mentionUserIds: selectedMentions,
    };

    // Create optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      teamId,
      senderId: currentUserId,
      senderName: "You",
      content,
      messageType,
      documentId: messageType === "CHANGE_REQUEST" ? selectedDocumentId : null,
      mentionUserIds: selectedMentions,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    // Add optimistic message to state immediately
    setMessages((prev) => [...prev, optimisticMessage].slice(-MAX_MESSAGES));
    clearComposer();

    try {
      const persisted = await chatService.sendFallback(teamId, payload);
      // Replace the optimistic message with the stored version so refreshes keep it.
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optimisticMessage.id ? { ...persisted, isPending: false } : msg))
      );
      setError("");
    } catch (sendError) {
      setError(sendError.message || "Failed to send message");
      // Remove failed optimistic message
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    }
  };

  const handleRightClick = (event, message) => {
    event.preventDefault();
    setSelectedContextMessage(message);
    setContextMenuPosition({ top: event.clientY, left: event.clientX });
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setError("");
  };

  const handleEdit = (message) => {
    setEditingMessageId(message.id);
    setEditDraft(message.content);
  };

  const handleDelete = async (messageId, scope) => {
    const messageIdStr = String(messageId);
    try {
      console.debug('[TeamChat] delete request', { teamId, messageId: messageIdStr, scope });
      const resp = await teamsApi.deleteTeamChatMessage(teamId, messageIdStr, scope);
      console.debug('[TeamChat] delete response', resp);

      // Normalize id comparisons to strings so removal is reliable
      setMessages((prev) => removeMessageById(prev, messageIdStr));
      setError("");
    } catch (deleteError) {
      console.error('[TeamChat] delete failed', deleteError);
      setError(deleteError.message || "Failed to delete message");
    }
  };

  const handleMarkSeen = async (message) => {
    try {
      const liveMessage = displayMessages.find((m) => String(m.id) === String(message.id)) || message;
      setInfoModalMessageId(message.id);
      setInfoModalMessage(liveMessage);

      // Ensure this user is marked as delivered/seen when opening the info modal
      const payloadDelivered = liveMessage.deliveredTo ?? liveMessage.delivered_to ?? [];
      const payloadSeen = liveMessage.seenBy ?? liveMessage.seen_by ?? [];
      const alreadyDelivered = Array.isArray(payloadDelivered) && payloadDelivered.map(Number).includes(currentUserId);
      const alreadySeen = Array.isArray(payloadSeen) && payloadSeen.map(Number).includes(currentUserId);

      if (Number(liveMessage.senderId) !== currentUserId) {
        // Mark delivered if not already
        if (!alreadyDelivered) {
          try {
            await teamsApi.postTeamChatReceipts(teamId, { items: [{ messageId: liveMessage.id, kind: "DELIVERED" }] });
            markMessageReceiptsLocally(liveMessage.id, {
              deliveredTo: addUniqueNumber(payloadDelivered, currentUserId),
              seenBy: payloadSeen,
            });
          } catch {
            // ignore transient errors
          }
        }

        // Mark seen when user inspects the message (open modal implies viewing)
        if (!alreadySeen) {
          try {
            await teamsApi.postTeamChatReceipts(teamId, { items: [{ messageId: liveMessage.id, kind: "SEEN" }] });
            markMessageReceiptsLocally(liveMessage.id, {
              deliveredTo: payloadDelivered,
              seenBy: addUniqueNumber(payloadSeen, currentUserId),
            });
          } catch {
            // ignore transient errors
          }
        }
      }

      const messageInfo = await teamsApi.getTeamChatMessageInfo(teamId, liveMessage.id);
      const fetchedInfo = messageInfo?.data ?? messageInfo;
      if (fetchedInfo) {
        setInfoModalMessage((prev) => mergeReceiptFields(liveMessage, mergeReceiptFields(prev, fetchedInfo)));
      }
    } catch (infoError) {
      setError(infoError.message || "Failed to fetch message info");
    }
  };

  const saveEdit = async () => {
    if (!editDraft.trim()) {
      setError("Message cannot be empty");
      return;
    }

    const editingMessage = messages.find((m) => String(m.id) === String(editingMessageId));
    const editedType = editingMessage?.messageType ?? "TEXT";

    try {
      const response = await teamsApi.editTeamChatMessage(teamId, editingMessageId, {
        content: editDraft.trim(),
        messageType: editedType,
      });
      const updatedMessage = response?.data ?? response;

      setMessages((prev) => updateMessageById(prev, editingMessageId, () => updatedMessage));
      setEditingMessageId(null);
      setEditDraft("");
      setError("");
    } catch (editError) {
      setError(editError.message || "Failed to edit message");
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditDraft("");
  };

  const handleOpenDocument = (documentId) => {
    if (!documentId || typeof onOpenDocument !== "function") return;
    onOpenDocument(documentId);
  };

  const markMessageReceiptsLocally = (messageId, patch) => {
    if (!messageId) return;
    const id = String(messageId);
    setReceiptSnapshots((prev) => ({
      ...prev,
      [id]: {
        deliveredTo: patch.deliveredTo,
        seenBy: patch.seenBy,
      },
    }));
    setMessages((prev) =>
      updateMessageById(prev, id, (message) => ({
        ...message,
        deliveredTo: patch.deliveredTo ?? message.deliveredTo,
        seenBy: patch.seenBy ?? message.seenBy,
      }))
    );
  };

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-text">Team Chat</h3>
          <p className="text-sm text-muted">Realtime discussion with mentions and change requests</p>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${socketConnected ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}>
          {socketConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          {socketConnected ? "Live" : "Offline"}
        </div>
      </header>

      {isChatBlocked ? (
        <div className="flex h-[380px] flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500 dark:text-rose-400">Chat Unavailable</p>
            <h4 className="mt-3 text-xl font-semibold text-text">You have been blocked from this group chat</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              Sending and reading group messages is disabled until the team leader restores your chat access.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div ref={chatContainerRef} className="h-[380px] space-y-3 overflow-y-auto px-4 py-4">
            {loadingHistory && <p className="text-sm text-muted">Loading messages...</p>}
            {!loadingHistory && messages.length === 0 && (
              <p className="text-sm text-muted">No messages yet. Start the conversation.</p>
            )}

            {(() => {
              const firstUnreadIndex = displayMessages.findIndex((message) => {
                const seenIds = Array.isArray(message.seenBy)
                  ? message.seenBy.map(Number)
                  : [];
                return Number(message.senderId) !== currentUserId && !seenIds.includes(currentUserId);
              });

              return displayMessages.map((message, index) => (
                <TeamChatMessageItem
                  key={message.id}
                  message={message}
                  index={index}
                  firstUnreadIndex={firstUnreadIndex}
                  currentUserId={currentUserId}
                  members={members}
                  documents={documents}
                  canManageAllTeamDocs={canManageAllTeamDocs}
                  onContextMenu={handleRightClick}
                  onOpenDocument={handleOpenDocument}
                />
              ));
            })()}
          </div>

          <div className="border-t border-border px-4 py-4">
            {replyingTo && !editingMessageId && (
              <div className="mb-3 flex items-start justify-between gap-2 rounded-lg border border-border bg-slate-50 px-3 py-2 text-sm text-text dark:bg-white/5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Replying to</p>
                  <p className="truncate font-medium text-text">{replyingTo.senderName}</p>
                  <p className="truncate text-xs text-muted">{replyingTo.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Edit mode indicator */}
            {editingMessageId && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-amber-800">Editing message</p>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs font-medium text-amber-700 hover:text-amber-900"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs italic text-amber-700">Press Enter or click Send to save changes</p>
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMessageType("CHANGE_REQUEST")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${messageType === "CHANGE_REQUEST" ? "bg-blue-600 text-white" : "bg-slate-100 text-muted dark:bg-white/10 dark:text-text"}`}
              >
                Request to Change a Document
              </button>
            </div>

            {messageType === "CHANGE_REQUEST" && (
              <select
                value={selectedDocumentId}
                onChange={(event) => setSelectedDocumentId(event.target.value)}
                className="mb-3 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text focus:border-blue-400 focus:outline-none dark:focus:border-blue-500"
              >
                <option value="">Select document for this request</option>
                {(documents || []).map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            )}

            <div className="relative rounded-xl border border-border bg-card focus-within:border-blue-400 dark:focus-within:border-blue-500">
              <div
                aria-hidden
                className="pointer-events-none min-h-[4.5rem] whitespace-pre-wrap break-words px-3 py-2 pr-12 text-sm leading-normal text-text"
              >
                {highlightDraftMentions(editingMessageId ? editDraft : draft)}
              </div>
              <textarea
                value={editingMessageId ? editDraft : draft}
                onChange={(event) => {
                  if (editingMessageId) {
                    setEditDraft(event.target.value);
                  } else {
                    onDraftChange(event.target.value);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (editingMessageId) {
                      saveEdit();
                    } else {
                      sendMessage();
                    }
                  }
                }}
                rows={3}
                placeholder="Type a message. Use @ to mention a teammate"
                className="absolute inset-0 w-full resize-none rounded-xl border-0 bg-transparent px-3 py-2 pr-12 text-sm leading-normal text-transparent placeholder:text-muted focus:outline-none"
              />

              <button
                type="button"
                onClick={editingMessageId ? saveEdit : sendMessage}
                className="absolute bottom-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
              >
                <Send size={16} />
              </button>

              {showMentionMenu && mentionCandidates.length > 0 && (
                <div className="absolute bottom-14 left-0 z-10 w-full rounded-xl border border-border bg-card p-2 shadow-lg">
                  {mentionCandidates.map((member) => (
                    <button
                      key={member.id || member.userId}
                      type="button"
                      onClick={() => addMention(member)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-slate-50 dark:hover:bg-white/10"
                    >
                      <span>{member.fullName || member.email}</span>
                      <span className="text-xs text-muted">@</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <MessageContextMenu
            message={selectedContextMessage}
            currentUserId={currentUserId}
            position={contextMenuPosition}
            onClose={() => {
              setContextMenuPosition(null);
              setSelectedContextMessage(null);
            }}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkSeen={handleMarkSeen}
          />

          <MessageInfoModal
            message={infoModalMessage}
            members={members}
            teamId={teamId}
            onClose={() => {
              setInfoModalMessage(null);
              setInfoModalMessageId(null);
            }}
            currentUserId={currentUserId}
            currentUserName={authService.getUserFullName()}
            socketConnected={socketConnected}
          />
        </>
      )}
    </section>
  );
}

