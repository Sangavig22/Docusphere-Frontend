import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Popover({
  open,
  onClose,
  className = "",
  children,
  anchorRef,
  portal = true,
  side = "auto",
  pushContent = false,
  scrollable = true,
}) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const [placement, setPlacement] = useState("bottom");
  const usePortal = portal && !!anchorRef;
  const pushedRef = useRef({ el: null, prevPaddingBottom: "", applied: false });

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
    const canOpenBelow = rect.bottom + gap + effectiveMenuHeight <= boundaryRect.bottom - padding;

    let openAbove = false;
    if (side === "top") {
      openAbove = true;
    } else if (side === "bottom") {
      openAbove = !canOpenBelow && canOpenAbove;
    } else {
      // auto: open above when below doesn't fit and above has more room
      openAbove = !canOpenBelow && canOpenAbove;
      if (!openAbove && canOpenBelow) {
        openAbove = false;
      } else if (!canOpenBelow && !canOpenAbove) {
        openAbove = spaceAbove > spaceBelow;
      }
    }

    const top = openAbove
      ? Math.max(minTop, rect.top - effectiveMenuHeight - gap)
      : Math.max(minTop, rect.bottom + gap);

    const availableHeightBelow = Math.max(0, boundaryRect.bottom - top - padding);
    const availableHeightAbove = Math.max(0, rect.top - gap - minTop);
    const maxMenuHeight = openAbove
      ? Math.min(effectiveMenuHeight, availableHeightAbove)
      : Math.min(effectiveMenuHeight, availableHeightBelow);

    const leftAlignEnd = rect.right - effectiveMenuWidth;
    const leftAlignStart = rect.left;
    const preferredLeft = leftAlignEnd < minLeft ? leftAlignStart : leftAlignEnd;
    const left = maxLeft < minLeft ? minLeft : Math.min(Math.max(minLeft, preferredLeft), maxLeft);

    setPlacement(openAbove ? "top" : "bottom");
    setStyle({
      position: "fixed",
      top,
      left,
      maxHeight: usePortal ? Math.max(120, maxMenuHeight) : scrollable ? maxMenuHeight : undefined,
      maxWidth: Math.max(0, boundaryRect.right - left - padding),
    });
  }, [anchorRef, scrollable, side, usePortal]);

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) return;

    if (usePortal) updatePosition();

    // Near the bottom of the viewport, scroll to reveal the full menu when requested.
    if (pushContent && side !== "top") {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuRect = ref.current?.getBoundingClientRect();
      const menuHeight = menuRect?.height ?? 320;
      const padding = 12;
      const gap = 8;

      const availableBelow = window.innerHeight - padding - (rect.bottom + gap);
      const needed = Math.max(0, menuHeight - availableBelow);

      if (needed > 0) {
        const scrollParent = getScrollParent(anchorRef.current);
        if (
          scrollParent &&
          scrollParent !== document.documentElement &&
          scrollParent !== document.body
        ) {
          const prevPaddingBottom = scrollParent.style.paddingBottom;
          const prevNum = Number.parseFloat(prevPaddingBottom || "0") || 0;
          scrollParent.style.paddingBottom = `${prevNum + needed}px`;
          pushedRef.current = { el: scrollParent, prevPaddingBottom, applied: true };
          scrollParent.scrollTop += needed;
        } else {
          window.scrollBy({ top: needed, behavior: "auto" });
        }
      }
    }

    if (usePortal) updatePosition();

    return () => {
      if (pushedRef.current.applied && pushedRef.current.el) {
        pushedRef.current.el.style.paddingBottom = pushedRef.current.prevPaddingBottom;
      }
      pushedRef.current = { el: null, prevPaddingBottom: "", applied: false };
    };
  }, [open, anchorRef, updatePosition, getScrollParent, usePortal, pushContent, side]);

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
        "z-[9999] w-56 overscroll-contain rounded-xl border border-border bg-card p-1 shadow-xl",
        usePortal || scrollable ? "overflow-y-auto" : "overflow-visible",
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