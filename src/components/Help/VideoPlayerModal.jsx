import React, { useEffect, useRef } from "react";
import { X, Play, Clock, Sparkles } from "lucide-react";

export default function VideoPlayerModal({ video, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    // Focus modal container on mount
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Listen to Escape key down
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const isVideoAvailable = video.available && (video.videoId || video.youtubeUrl);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-video-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-card border border-border text-card-foreground shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/40">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {video.category}
            </span>
            {video.duration && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {video.duration}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Content */}
        <div className="relative aspect-video w-full bg-black">
          {isVideoAvailable ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=0&rel=0`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-card/30 to-muted/20">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tutorial Coming Soon</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Our team is currently producing this video tutorial. It will be available shortly! You can still read the step-by-step guides and FAQs below.
              </p>
            </div>
          )}
        </div>

        {/* Description Panel */}
        <div className="p-5 bg-card">
          <h2 id="modal-video-title" className="text-lg font-bold text-foreground">
            {video.title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
}
