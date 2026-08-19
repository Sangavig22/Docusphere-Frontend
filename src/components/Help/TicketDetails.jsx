import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Clock, ShieldAlert, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { helpSupportService } from "../../services/helpSupportService";

export default function TicketDetails({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const userRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || "";
  const isAdmin = userRole.toUpperCase() === "ROLE_ADMIN" || userRole.toUpperCase() === "ADMIN";

  const messagesEndRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const data = await helpSupportService.getTicketById(ticketId);
      setTicket(data);
      const messagesData = await helpSupportService.getTicketMessages(ticketId);
      setMessages(messagesData || []);
    } catch (err) {
      toast.error(err.message || "Failed to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();

    // Listen to background agent response trigger event
    const handleResponse = (e) => {
      if (String(e.detail.ticketId) === String(ticketId)) {
        fetchTicket();
      }
    };

    window.addEventListener("docusphere_support_ticket_updated", handleResponse);

    return () => {
      window.removeEventListener("docusphere_support_ticket_updated", handleResponse);
    };
  }, [ticketId]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      await helpSupportService.sendMessage(ticketId, replyText.trim());
      setReplyText("");
      // Refresh ticket and messages
      const ticketData = await helpSupportService.getTicketById(ticketId);
      setTicket(ticketData);
      const messagesData = await helpSupportService.getTicketMessages(ticketId);
      setMessages(messagesData || []);
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await helpSupportService.updateTicketStatus(ticketId, newStatus);
      toast.success(`Ticket status updated to ${newStatus.replace("_", " ")}`);
      await fetchTicket();
    } catch (err) {
      toast.error(err.message || "Failed to update ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const val = String(status).toUpperCase();
    switch (val) {
      case "OPEN":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20";
      case "RESOLVED":
        return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20";
    }
  };

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted mt-2">Loading ticket conversation...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center text-muted flex flex-col items-center justify-center min-h-[300px]">
        <ShieldAlert size={36} className="text-muted/60 mb-2" />
        <p className="text-sm font-semibold">Ticket not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-muted hover:text-text p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Back to tickets list"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400">
                Ticket #{ticket.id}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadge(ticket.status)}`}>
                {String(ticket.status || "").replace("_", " ").toLowerCase()}
              </span>
            </div>
            <h3 className="font-bold text-text text-base sm:text-lg truncate mt-1">
              {ticket.subject}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border text-xs text-muted">
          <div>
            <span className="block font-semibold text-text">Category</span>
            <span>{String(ticket.category || "").replace("_", " ").toLowerCase()}</span>
          </div>
          <div>
            <span className="block font-semibold text-text">Priority</span>
            <span>{String(ticket.priority || "").toLowerCase()}</span>
          </div>
          <div>
            <span className="block font-semibold text-text">Created</span>
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
          <div>
            <span className="block font-semibold text-text">Last Updated</span>
            <span>{formatDate(ticket.updatedAt)} {formatTime(ticket.updatedAt)}</span>
          </div>
        </div>

        {isAdmin && ticket.userFullName && (
          <div className="pt-3 border-t border-border text-xs text-muted">
            <span className="font-semibold text-text">Submitted By: </span>
            <span>{ticket.userFullName} ({ticket.userEmail})</span>
          </div>
        )}

        {isAdmin && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
            <span>Update Status (Admin Actions):</span>
            <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
              <button
                type="button"
                onClick={() => handleUpdateStatus("OPEN")}
                disabled={updatingStatus}
                className="px-2.5 py-1 rounded text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold uppercase transition-colors"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus("IN_PROGRESS")}
                disabled={updatingStatus}
                className="px-2.5 py-1 rounded text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold uppercase transition-colors"
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus("RESOLVED")}
                disabled={updatingStatus}
                className="px-2.5 py-1 rounded text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase transition-colors"
              >
                Resolved
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus("CLOSED")}
                disabled={updatingStatus}
                className="px-2.5 py-1 rounded text-[10px] bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-text font-bold uppercase transition-colors"
              >
                Closed
              </button>
            </div>
            {updatingStatus && <Loader2 size={12} className="animate-spin text-blue-600" />}
          </div>
        )}
      </div>

      {/* Conversation Thread */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[450px]">
        {/* Scrollable messages container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => {
              const isUser = msg.senderRole !== "ROLE_ADMIN";
              const isSystem = msg.message && msg.message.startsWith("Ticket status updated to");
              
              if (isSystem) {
                return (
                  <div key={msg.id || index} className="flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-muted font-semibold shadow-sm">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-card border border-border text-text rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.message}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser ? "text-blue-200" : "text-muted"
                      }`}
                    >
                      {msg.senderFullName && !isUser ? `${msg.senderFullName} • ` : ""}{formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted text-center p-6">
              <MessageCircle size={28} className="text-muted/50 mb-1" />
              <p className="text-sm">No messages in this conversation yet.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message reply input bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={sending}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-2 border border-border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
