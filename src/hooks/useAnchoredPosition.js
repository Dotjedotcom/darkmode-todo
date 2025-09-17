import { useEffect, useState } from 'react';

const VIEWPORT_MARGIN = 8;

export default function useAnchoredPosition(open, anchorRef, popoverRef, { width: forcedWidth = null, offset = 8, deps = [] } = {}) {
  const [style, setStyle] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const popover = popoverRef.current;
      const rect = anchor.getBoundingClientRect();
      const measuredWidth = popover?.offsetWidth ?? forcedWidth ?? rect.width;
      const measuredHeight = popover?.offsetHeight ?? 0;

      let top = rect.bottom + offset;
      if (top + measuredHeight > window.innerHeight - VIEWPORT_MARGIN) {
        top = Math.max(VIEWPORT_MARGIN, rect.top - measuredHeight - offset);
      }

      let left = rect.left + rect.width / 2 - measuredWidth / 2;
      const maxLeft = window.innerWidth - measuredWidth - VIEWPORT_MARGIN;
      left = Math.min(Math.max(left, VIEWPORT_MARGIN), Math.max(maxLeft, VIEWPORT_MARGIN));

      setStyle({
        top: top + window.scrollY,
        left: left + window.scrollX,
        width: measuredWidth,
        minWidth: measuredWidth,
      });
    };

    update();
    const frame = requestAnimationFrame(update);
    const timer = setTimeout(update, 50);
    const handleViewportChange = () => update();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open, anchorRef, popoverRef, forcedWidth, offset, Array.isArray(deps) ? deps.join('|') : deps]);

  return style;
}
