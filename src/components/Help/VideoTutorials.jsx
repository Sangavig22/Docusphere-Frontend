import React, { useState, useEffect, useRef } from "react";
import { Play, X, Clock, HelpCircle } from "lucide-react";
import { getYoutubeThumbnail, extractYoutubeId } from "../../utils/youtube";

export default function VideoTutorials({ tutorials, activeTutorialId, clearActiveTutorial }) {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Adjust state during rendering when activeTutorialId changes
  const [prevActiveTutorialId, setPrevActiveTutorialId] = useState(activeTutorialId);
  if (activeTutorialId !== prevActiveTutorialId) {
    setPrevActiveTutorialId(activeTutorialId);
    if (activeTutorialId) {
      const found = tutorials.find((t) => t.id === activeTutorialId);
      if (found) {
        setSelectedTutorial(found);
      }
    }
  }

  // Clear the parent's activeTutorialId in an effect to avoid render-phase side effects
  useEffect(() => {
    if (activeTutorialId) {
      clearActiveTutorial?.();
    }
  }, [activeTutorialId, clearActiveTutorial]);

  const closeModal = () => {
    setSelectedTutorial(null);
    triggerRef.current?.focus();
  };

  // Handle keypress Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (selectedTutorial) {
      window.addEventListener("keydown", handleKeyDown);
      // Focus modal container for accessibility
      modalRef.current?.focus();
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedTutorial]);

  const availableTutorials = tutorials.filter((t) => t.available);

  const categories = ["All", ...new Set(availableTutorials.map((t) => t.category))];

  const filteredTutorials =
    activeCategory === "All"
      ? availableTutorials
      : availableTutorials.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              activeCategory === cat
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-card border-border text-text hover:bg-gray-50 dark:hover:bg-slate-800/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tut) => {
          const videoId = extractYoutubeId(tut.videoId || tut.youtubeUrl);
          const thumbUrl = videoId ? getYoutubeThumbnail(videoId) : null;

          return (
            <div
              key={tut.id}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Thumbnail Area */}
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center group overflow-hidden">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={tut.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80 p-4 text-center text-slate-300">
                    <HelpCircle size={28} className="text-slate-400 mb-1" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Placeholder</span>
                    <span className="text-sm font-semibold mt-1">DocuSphere Tutorial</span>
                  </div>
                )}
                {/* Play Button Overlay */}
                <button
                  type="button"
                  ref={selectedTutorial?.id === tut.id ? triggerRef : null}
                  onClick={() => setSelectedTutorial(tut)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-90 group-hover:opacity-100 transition-opacity"
                  aria-label={`Play tutorial: ${tut.title}`}
                >
                  <div className="bg-blue-600 hover:bg-blue-500 hover:scale-110 text-white p-3.5 rounded-full shadow-lg transition-transform">
                    <Play size={20} fill="currentColor" />
                  </div>
                </button>
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1">
                  <Clock size={10} />
                  <span>{tut.duration}</span>
                </div>
              </div>

              {/* Text info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                    {tut.category}
                  </span>
                  <h4 className="font-semibold text-text text-sm sm:text-base line-clamp-1">
                    {tut.title}
                  </h4>
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {tut.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-border mt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTutorial(tut)}
                    className="w-full text-center py-2 border border-border text-xs font-semibold rounded-lg text-text hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    Watch Tutorial
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Modal overlay */}
      {selectedTutorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={modalRef}
            tabIndex="-1"
            className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden w-full max-w-3xl focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-text text-base sm:text-lg line-clamp-1">
                {selectedTutorial.title}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted hover:text-text p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close video dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content: Video frame or placeholder */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {selectedTutorial.available && selectedTutorial.videoId ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedTutorial.videoId}?rel=0`}
                  title={selectedTutorial.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="p-8 text-center text-slate-300 max-w-md flex flex-col items-center gap-2">
                  <HelpCircle size={48} className="text-blue-500 mb-2" />
                  <h4 className="text-xl font-bold text-white">Coming Soon</h4>
                  <p className="text-sm text-slate-400">
                    This tutorial will be available soon. Please check back later.
                  </p>
                </div>
              )}
            </div>

            {/* Description Details */}
            <div className="p-5 border-t border-border bg-slate-50 dark:bg-slate-900/30">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                {selectedTutorial.category} • {selectedTutorial.duration} min
              </span>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                {selectedTutorial.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
