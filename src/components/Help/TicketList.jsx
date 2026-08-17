import React, { useState } from "react";
import { MessageSquare, Clock, ShieldAlert } from "lucide-react";

export default function TicketList({ tickets, onSelectTicket }) {
  const [filterStatus, setFilterStatus] = useState("All");

  const statuses = ["All", "Open", "In Progress", "Resolved", "Closed"];

  const filteredTickets =
    filterStatus === "All"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
      case "Medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20";
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

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter status buttons */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              filterStatus === status
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-card border-border text-text hover:bg-gray-50 dark:hover:bg-slate-800/40"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Ticket List Cards */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400">
                    #{ticket.id}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {ticket.category}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <h4 className="font-semibold text-text text-sm sm:text-base line-clamp-1">
                  {ticket.subject}
                </h4>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Updated: {formatDate(ticket.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    <span>{ticket.messages?.length || 0} messages</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-blue-500 font-semibold hover:underline hidden sm:inline-block mt-2">
                  View Conversation →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center text-muted flex flex-col items-center justify-center min-h-[250px]">
          <ShieldAlert size={36} className="text-muted/60 mb-2" />
          <p className="text-sm font-semibold">No tickets found</p>
          <p className="text-xs text-muted/80 mt-1">There are no support requests matching the selected filter status.</p>
        </div>
      )}
    </div>
  );
}
