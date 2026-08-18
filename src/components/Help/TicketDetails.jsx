import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Clock, ShieldAlert, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import { supportService } from "../../services/supportService";

export default function TicketDetails({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await supportService.getTicketById(ticketId);
        setTicket(data);
      } catch (err) {
        toast.error(err.message || "Failed to load ticket details.");
      } finally {
        setLoading(false);
      }
    };

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
  }, [ticket?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const updated = await supportService.addTicketMessage(ticketId, replyText.trim());
      setTicket(updated);
      setReplyText("");
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20";
      case "In Progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20";
      case "Resolved":
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
                {ticket.status}
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
            <span>{ticket.category}</span>
          </div>
          <div>
            <span className="block font-semibold text-text">Priority</span>
            <span>{ticket.priority}</span>
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
      </div>

      {/* Conversation Thread */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[450px]">
        {/* Scrollable messages container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/10">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg, index) => {
              const isUser = msg.sender === "user";
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
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser ? "text-blue-200" : "text-muted"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
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
