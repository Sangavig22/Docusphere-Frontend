import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Popover({ open, onClose, className = "", children, anchorRef, portal = true }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const [placement, setPlacement] = useState("bottom");
  const usePortal = portal && !!anchorRef;

  const getScrollParent = useCallback((startEl) => {
    let el = startEl;
    while (el) {
      const { overflowY } = getComputedStyle(el);
      if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return el;
      el = el.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }, []);

  const updatePosition = useCallback(() => {
    if (!usePortal) return;
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuRect = ref.current?.getBoundingClientRect();
    const menuWidth = menuRect?.width ?? 224;
    const menuHeight = menuRect?.height ?? 320;
    const padding = 12;
    const gap = 8;

    // Calculate top bar height (approximately 80px based on Topbar component)
    const topBarHeight = 80;
    
    // Use the full viewport as boundary but account for top bar
    const boundaryRect = {
      left: 0,
      top: topBarHeight, // Start below the top bar
      right: window.innerWidth,
      bottom: window.innerHeight,
    };

    const minLeft = Math.max(padding, boundaryRect.left + padding);
    const minTop = Math.max(padding, boundaryRect.top + padding);

    const availableWidth = Math.max(0, boundaryRect.right - minLeft - padding);
    const availableHeight = Math.max(0, boundaryRect.bottom - minTop - padding);
    const effectiveMenuWidth = Math.min(menuWidth, availableWidth || menuWidth);
    const effectiveMenuHeight = Math.min(menuHeight, availableHeight || menuHeight);

    const maxLeft = Math.min(
      window.innerWidth - padding - effectiveMenuWidth,
      boundaryRect.right - padding - effectiveMenuWidth,
    );
    const maxTop = Math.min(
      window.innerHeight - padding - effectiveMenuHeight,
      boundaryRect.bottom - padding - effectiveMenuHeight,
    );

    const spaceBelow = boundaryRect.bottom - (rect.bottom + gap) - padding;
    const spaceAbove = rect.top - gap - minTop;
    const canOpenAbove = rect.top - gap - effectiveMenuHeight >= minTop;
    
    // Always prefer opening below unless there's absolutely no space
    // and there's more space above
    const openAbove =
      canOpenAbove && (spaceBelow < effectiveMenuHeight && spaceAbove > spaceBelow);

    const preferredTop = openAbove
      ? rect.top - effectiveMenuHeight - gap
      : rect.bottom + gap;
    const top = maxTop < minTop ? minTop : Math.min(Math.max(minTop, preferredTop), maxTop);

    const leftAlignEnd = rect.right - effectiveMenuWidth;
    const leftAlignStart = rect.left;
    const preferredLeft = leftAlignEnd < minLeft ? leftAlignStart : leftAlignEnd;
    const left = maxLeft < minLeft ? minLeft : Math.min(Math.max(minLeft, preferredLeft), maxLeft);

    // If menu would be cut off at bottom, scroll it into view
    if (!openAbove && preferredTop + effectiveMenuHeight > window.innerHeight - padding) {
      const scrollParent = getScrollParent(anchorRef.current);
      if (scrollParent && scrollParent !== document.documentElement) {
        const additionalScroll = (preferredTop + effectiveMenuHeight) - (window.innerHeight - padding);
        scrollParent.scrollTop += additionalScroll;
      }
    }

    setPlacement(openAbove ? "top" : "bottom");
    setStyle({
      position: "fixed",
      top,
      left,
      maxHeight: Math.max(0, boundaryRect.bottom - top - padding),
      maxWidth: Math.max(0, boundaryRect.right - left - padding),
    });
  }, [anchorRef, getScrollParent, usePortal]);

  useLayoutEffect(() => {
    if (!open || !usePortal || !anchorRef?.current) return;
    updatePosition();
    
    // Additional scroll check after a short delay to ensure menu is rendered
    const timer = setTimeout(() => {
      if (!anchorRef?.current || !ref.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const menuRect = ref.current.getBoundingClientRect();
      const menuHeight = menuRect?.height ?? 320;
      const padding = 12;
      const topBarHeight = 80;
      
      // If menu would be cut off at bottom, scroll the container
      if (rect.bottom + menuHeight + padding > window.innerHeight) {
        const scrollParent = getScrollParent(anchorRef.current);
        if (scrollParent && scrollParent !== document.documentElement) {
          const additionalScroll = (rect.bottom + menuHeight + padding) - window.innerHeight;
          scrollParent.scrollTop += additionalScroll;
        }
      }
      
      // If menu would overlap with top bar when opening above, adjust
      if (rect.top - menuHeight - padding < topBarHeight) {
        const scrollParent = getScrollParent(anchorRef.current);
        if (scrollParent && scrollParent !== document.documentElement) {
          const additionalScroll = topBarHeight - (rect.top - menuHeight - padding);
          if (additionalScroll > 0) {
            scrollParent.scrollTop += additionalScroll;
          }
        }
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [open, anchorRef, updatePosition, getScrollParent, usePortal]);

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

    const scrollParent = anchorRef?.current ? getScrollParent(anchorRef.current) : null;

    document.addEventListener("mousedown", onMouseDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    
    if (usePortal) {
      scrollParent?.addEventListener("scroll", updatePosition, true);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    
    return () => {
      document.removeEventListener("mousedown", onMouseDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      if (usePortal) {
        scrollParent?.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      }
    };
  }, [open, onClose, anchorRef, updatePosition, getScrollParent, usePortal]);

  useEffect(() => {
    if (!open || !usePortal || !anchorRef?.current || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => updatePosition());
    observer.observe(anchorRef.current);
    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [open, anchorRef, updatePosition, usePortal]);

  if (!open) return null;

  const content = (
    <div
      ref={ref}
      className={[
        "z-[9999] w-56 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xl",
        !usePortal && "absolute",
        className,
      ].join(" ")}
      style={usePortal ? style : undefined}
      role="menu"
      data-side={placement}
    >
      {children}
    </div>
  );

  return usePortal ? createPortal(content, document.body) : content;
}

