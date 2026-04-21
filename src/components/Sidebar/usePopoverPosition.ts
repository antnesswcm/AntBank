import { useState, useRef, useEffect, useCallback } from 'react';

interface PopoverPosition {
  top: number;
  left: number;
}

interface UsePopoverPositionReturn {
  popoverPosition: PopoverPosition;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  openPopover: (itemId: string, element: HTMLElement) => void;
  closePopover: () => void;
  togglePopover: (itemId: string, element: HTMLElement) => void;
  isPopoverOpen: (itemId: string) => boolean;
}

export function usePopoverPosition(): UsePopoverPositionReturn {
  const [popoverItem, setPopoverItem] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (popoverItem) {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setPopoverItem(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popoverItem]);

  const openPopover = useCallback((itemId: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setPopoverPosition({ top: rect.top, left: rect.right + 4 });
    triggerRef.current = element;
    setPopoverItem(itemId);
  }, []);

  const closePopover = useCallback(() => {
    setPopoverItem(null);
  }, []);

  const togglePopover = useCallback(
    (itemId: string, element: HTMLElement) => {
      if (popoverItem === itemId) {
        closePopover();
      } else {
        openPopover(itemId, element);
      }
    },
    [popoverItem, openPopover, closePopover]
  );

  const isPopoverOpen = useCallback(
    (itemId: string) => {
      return popoverItem === itemId;
    },
    [popoverItem]
  );

  return {
    popoverPosition,
    popoverRef,
    openPopover,
    closePopover,
    togglePopover,
    isPopoverOpen,
  };
}
