import React, { useState } from "react";
import { toast } from "react-toastify";
import { supportService } from "../../services/supportService";

const CATEGORIES = [
  "Account",
  "Document Upload",
  "Document Management",
  "OCR",
  "AI Summarization",
  "Sharing",
  "Security",
  "Collaboration",
  "Version Control",
  "Other"
];

const PRIORITIES = ["Low", "Medium", "High"];

export default function ContactSupportForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "Medium",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.subject.trim() || formData.subject.trim().length < 5) {
      toast.error("Subject is required and must be at least 5 characters long.");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a valid category.");
      return false;
    }
    if (!formData.priority) {
      toast.error("Please select a valid priority.");
      return false;
    }
    if (!formData.description.trim() || formData.description.trim().length < 15) {
      toast.error("Description must be at least 15 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTicketResult(null);

    try {
      const ticket = await supportService.createTicket(formData);
      toast.success("Your support request has been submitted.");
      setTicketResult(ticket);
      setFormData({
        subject: "",
        category: "",
        priority: "Medium",
        description: "",
      });
      if (onSuccess) {
        onSuccess(ticket);
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit support request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm max-w-2xl mx-auto">
      {ticketResult ? (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
            ✓
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-text">Ticket Submitted Successfully</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Ticket #{ticketResult.id}</p>
            <p className="text-sm text-muted">
              Your support request has been submitted. You can view your ticket and follow the conversation under "My Tickets".
            </p>
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setTicketResult(null)}
              className="px-4 py-2 border border-border text-xs font-semibold rounded-lg text-text hover:bg-gray-50 dark:hover:bg-slate-800/40"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className="text-sm font-semibold text-text">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of the issue (e.g. OCR text is corrupted)"
              disabled={loading}
              className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="text-sm font-semibold text-text">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-lg bg-card text-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="priority" className="text-sm font-semibold text-text">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3.5 py-2 text-sm border border-border rounded-lg bg-card text-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-text">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Provide a detailed description of the problem. If applicable, mention step-by-step what you were doing or include relevant error messages."
              disabled={loading}
              className="w-full px-3.5 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
