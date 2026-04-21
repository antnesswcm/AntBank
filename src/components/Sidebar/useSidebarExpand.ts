import { useState, useRef, useEffect, useCallback } from 'react';
import type { SubmenuMode, CollapseBehavior } from './types';

interface UseSidebarExpandReturn {
  expandedItems: Set<string>;
  toggleExpand: (id: string) => void;
  isExpanded: (id: string) => boolean;
}

export function useSidebarExpand(
  collapsed: boolean,
  submenuMode: SubmenuMode,
  collapseBehavior: CollapseBehavior
): UseSidebarExpandReturn {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const prevExpandedItemsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const shouldAutoCollapse =
      submenuMode === 'mixed' || (submenuMode === 'inline' && collapseBehavior === 'reset');

    if (collapsed) {
      if (shouldAutoCollapse) {
        prevExpandedItemsRef.current = new Set(expandedItems);
        setExpandedItems(new Set());
      }
    } else {
      if (shouldAutoCollapse && prevExpandedItemsRef.current.size > 0) {
        setExpandedItems(prevExpandedItemsRef.current);
      }
    }
  }, [collapsed, submenuMode, collapseBehavior]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (id: string) => {
      return expandedItems.has(id);
    },
    [expandedItems]
  );

  return { expandedItems, toggleExpand, isExpanded };
}
