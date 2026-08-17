import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQAccordion({ faqs, searchQuery }) {
  const [openIds, setOpenIds] = useState(new Set());

  const toggleAccordion = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Helper to highlight matching search term
  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-100 text-yellow-800 rounded-sm px-0.5 dark:bg-yellow-500/30 dark:text-yellow-200">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq) => {
        const isOpen = openIds.has(faq.id);
        return (
          <div
            key={faq.id}
            className="rounded-xl border border-border bg-card shadow-sm transition-all overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleAccordion(faq.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium text-text hover:bg-gray-50 dark:hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`faq-content-${faq.id}`}
              id={`faq-btn-${faq.id}`}
            >
              <span className="text-base sm:text-lg">
                {highlightText(faq.question, searchQuery)}
              </span>
              <ChevronDown
                size={18}
                className={`text-muted transform transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              id={`faq-content-${faq.id}`}
              aria-labelledby={`faq-btn-${faq.id}`}
              className={`transition-all duration-200 ease-in-out ${
                isOpen ? "max-h-[1000px] border-t border-border opacity-100" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="px-5 py-4 text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
                {highlightText(faq.answer, searchQuery)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
