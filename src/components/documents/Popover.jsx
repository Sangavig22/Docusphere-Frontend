import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Popover({ open, onClose, className = "", children, anchorRef }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const padding = 8;
    setStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: Math.min(rect.right - menuWidth, Math.max(padding, rect.right - menuWidth)),
    });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      onClose?.();
    }

    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }

    document.addEventListener("mousedown", onMouseDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const usePortal = !!anchorRef;

  const content = (
    <div
      ref={ref}
      className={[
        "z-[9999] w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-xl",
        !usePortal && "absolute",
        className,
      ].join(" ")}
      style={usePortal ? style : undefined}
      role="menu"
    >
      {children}
    </div>
  );

  return usePortal ? createPortal(content, document.body) : content;
}

