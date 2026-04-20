import React, { useEffect, useId, useRef, useState } from "react";

export default function AdminDropdownMenu({
  trigger,
  children,
  align = "right",
  widthClassName = "w-44",
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target)) return;
      setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, []);

  const alignCls =
    align === "left"
      ? "left-0 origin-top-left"
      : "right-0 origin-top-right";

  return (
    <div ref={rootRef} className="relative inline-flex">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-controls={menuId}
        aria-expanded={open}
      >
        {trigger}
      </div>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={[
            "absolute z-50 mt-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150",
            widthClassName,
            alignCls,
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {typeof children === "function"
            ? children({ close: () => setOpen(false) })
            : children}
        </div>
      )}
    </div>
  );
}

