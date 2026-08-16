import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  Clock,
  Sparkles,
  LifeBuoy
} from "lucide-react";

import { helpSupportService } from "../services/helpSupportService";

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Send message states
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // Admin options
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketData = await helpSupportService.getTicketById(ticketId);
      setTicket(ticketData);

      const messagesData = await helpSupportService.getTicketMessages(ticketId);
      setMessages(messagesData || []);
    } catch (err) {
      toast.error(err.message || "Failed to load support ticket details.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSending(true);
      const newMessage = await helpSupportService.sendMessage(ticketId, replyText);
      setMessages((prev) => [...prev, newMessage]);
      setReplyText("");
      // Touch ticket updated timestamp
      if (ticket) {
        setTicket((prev) => ({
          ...prev,
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const updatedTicket = await helpSupportService.updateTicketStatus(ticketId, newStatus);
      setTicket(updatedTicket);
      toast.success(`Ticket status updated to ${newStatus.replace("_", " ")}`);
      // Reload messages because a status change logs a system message in the chat
      const messagesData = await helpSupportService.getTicketMessages(ticketId);
      setMessages(messagesData || []);
    } catch (err) {
      toast.error(err.message || "Failed to update ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground text-xs gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading conversation history...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground text-xs gap-3">
        <AlertCircle className="h-8 w-8 text-amber-500" />
        <span>Support ticket not found.</span>
        <Link to="/help" className="text-primary hover:underline font-semibold flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Help Center
        </Link>
      </div>
    );
  }

  const isAdmin = messages.some(m => m.senderRole === "ROLE_ADMIN"); // Quick heuristic or checking user context role if available

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <ToastContainer position="top-right" theme="colored" hideProgressBar />

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link to="/help" className="text-muted-foreground hover:text-foreground text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Help Center
        </Link>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Category: {ticket.category.replace("_", " ")}
        </span>
      </div>

      {/* Ticket Details Summary Card */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Ticket #{ticket.id}</span>
              <h1 className="text-lg md:text-xl font-extrabold text-foreground">{ticket.subject}</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              Created on {new Date(ticket.createdAt).toLocaleString()} • Last update: {new Date(ticket.updatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${
              ticket.status === "OPEN"
                ? "bg-blue-500/10 text-blue-500 border border-blue-500/25"
                : ticket.status === "IN_PROGRESS"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                : ticket.status === "RESOLVED"
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                : "bg-muted text-muted-foreground border border-border"
            }`}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className="px-2 py-0.5 rounded bg-muted text-[10px] uppercase font-bold text-muted-foreground border border-border">
              Priority: {ticket.priority}
            </span>
          </div>
        </div>

        {/* Admin Controls panel */}
        {updatingStatus && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin text-primary" /> Updating ticket status...
          </div>
        )}
        {/* Toggle options if user is support/admin */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
          <span>Update Status (Admin Actions):</span>
          <button
            onClick={() => handleUpdateStatus("OPEN")}
            className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors"
          >
            Open
          </button>
          <button
            onClick={() => handleUpdateStatus("IN_PROGRESS")}
            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors"
          >
            In Progress
          </button>
          <button
            onClick={() => handleUpdateStatus("RESOLVED")}
            className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
          >
            Resolved
          </button>
          <button
            onClick={() => handleUpdateStatus("CLOSED")}
            className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Closed
          </button>
        </div>
      </div>

      {/* Chat Conversation Logs */}
      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col min-h-[350px] max-h-[500px]">
        {/* Messages Feed Header */}
        <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <MessageSquare className="h-4 w-4 text-primary" /> Conversation Log
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
          {messages.length > 0 ? (
            messages.map((m) => {
              const isSystem = m.message.startsWith("Ticket status updated to");
              const isSenderAdmin = m.senderRole === "ROLE_ADMIN";
              
              if (isSystem) {
                return (
                  <div key={m.id} className="flex justify-center">
                    <span className="px-3 py-1 rounded-full bg-muted text-[10px] text-muted-foreground font-semibold flex items-center gap-1 shadow-sm">
                      <Sparkles className="h-3 w-3 text-primary" /> {m.message}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex ${isSenderAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs md:text-sm shadow-sm space-y-1 ${
                      isSenderAdmin
                        ? "bg-muted border border-border text-foreground rounded-tl-none"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] font-bold opacity-75">
                      <span>{isSenderAdmin ? "Support Agent" : m.senderFullName}</span>
                      <span className="font-medium">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs py-20">
              No messages logged.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Message Input Area */}
        <div className="border-t border-border p-3.5 bg-card">
          {ticket.status === "CLOSED" ? (
            <div className="bg-muted text-muted-foreground text-center py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
              <Lock className="h-4 w-4" /> This support ticket is closed. Reopen status to reply.
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                required
                disabled={sending}
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-muted/20 text-foreground text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 font-semibold text-xs md:text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
