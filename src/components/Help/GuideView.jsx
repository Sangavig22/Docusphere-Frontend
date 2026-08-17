import React, { useState } from "react";
import { BookOpen, Clock, ChevronRight } from "lucide-react";

export default function GuideView({ guides, faqs, onSelectVideo }) {
  const [selectedGuideId, setSelectedGuideId] = useState(null);

  const activeGuide = guides.find((g) => g.id === selectedGuideId);

  // Helper to find related FAQ content
  const getFaqQuestion = (faqId) => {
    const faq = faqs.find((f) => f.id === faqId);
    return faq ? faq.question : "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: List of Guides */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-blue-500" />
          Guides & Handbooks
        </h3>
        <div className="space-y-2">
          {guides.map((guide) => {
            const isSelected = guide.id === selectedGuideId;
            return (
              <button
                key={guide.id}
                type="button"
                onClick={() => setSelectedGuideId(guide.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSelected
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                    : "bg-card border-border hover:bg-gray-50 dark:hover:bg-slate-800/40 text-text"
                }`}
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{guide.title}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted mt-1">
                    <Clock size={12} />
                    <span>{guide.readingTime}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: Active Guide Detail */}
      <div className="lg:col-span-2">
        {activeGuide ? (
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-bold text-text mb-1">{activeGuide.title}</h3>
              <p className="text-sm text-muted">{activeGuide.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                <Clock size={14} />
                <span>{activeGuide.readingTime}</span>
              </div>
            </div>

            {/* Step list */}
            <div>
              <h4 className="font-bold text-text mb-4 text-base">Steps:</h4>
              <ol className="relative border-l border-blue-100 dark:border-slate-800 space-y-6 ml-4">
                {activeGuide.steps.map((step, idx) => (
                  <li key={idx} className="relative pl-6">
                    {/* Circle marker */}
                    <span className="absolute -left-[13px] top-0 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shadow-sm ring-4 ring-white dark:ring-slate-900">
                      {idx + 1}
                    </span>
                    <p className="text-text text-sm sm:text-base leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Related FAQs or Tutorials */}
            {(activeGuide.relatedFaqIds?.length > 0 || activeGuide.relatedTutorialId) && (
              <div className="border-t border-border pt-5 mt-6 space-y-4">
                <h4 className="font-semibold text-text text-sm sm:text-base">Related Resources:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Related FAQ link */}
                  {activeGuide.relatedFaqIds?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Related FAQs</span>
                      <ul className="space-y-1.5">
                        {activeGuide.relatedFaqIds.map((faqId) => {
                          const question = getFaqQuestion(faqId);
                          return question ? (
                            <li key={faqId}>
                              <span className="text-xs text-blue-500 hover:underline cursor-pointer block leading-normal">
                                • {question}
                              </span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Related Video link */}
                  {activeGuide.relatedTutorialId && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted uppercase tracking-wider block">Related Video</span>
                      <button
                        type="button"
                        onClick={() => onSelectVideo(activeGuide.relatedTutorialId)}
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1.5"
                      >
                        Watch step-by-step tutorial
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center text-muted flex flex-col items-center justify-center h-full min-h-[300px]">
            <BookOpen size={36} className="text-muted/60 mb-2" />
            <p className="text-sm">Select a guide from the left to view the step-by-step instructions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
