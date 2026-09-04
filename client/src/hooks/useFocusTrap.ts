import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Accessibility helper for modals/drawers:
 *  - focuses the first focusable element when opened
 *  - traps Tab navigation inside the dialog
 *  - closes on Escape
 *  - locks body scroll and restores focus on close
 */
export function useFocusTrap(active: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    const dialogNode = node;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = Array.from(dialogNode.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    (first ?? dialogNode).focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const current = document.activeElement;
      if (!dialogNode.contains(current)) {
        event.preventDefault();
        (first ?? dialogNode).focus();
        return;
      }
      // Cycle at the edges.
      if (event.shiftKey && current === first) {
        event.preventDefault();
        (last ?? dialogNode).focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        (first ?? dialogNode).focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [active, onClose]);

  return containerRef;
}
