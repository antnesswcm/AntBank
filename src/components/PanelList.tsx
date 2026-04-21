import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { HighlightText } from './HighlightText';
import './PanelList.css';

export interface PanelListItem {
  id: string | number;
  title: string;
  description?: string;
}

export type PanelListHeadLayout = 'title-only' | 'button-only' | 'title-button';

export interface PanelListProps {
  head?: React.ReactNode;
  headLayout?: PanelListHeadLayout;
  headTitle?: React.ReactNode;
  headAction?: React.ReactNode;
  items: PanelListItem[];
  onItemClick?: (item: PanelListItem) => void;
  selectedId?: string | number;
  emptyText?: string;
  titleEllipsis?: boolean;
  descEllipsis?: boolean;
  showIndex?: boolean;
  style?: React.CSSProperties;
  highlightKeywords?: string[];
  loop?: boolean;
}

export function PanelList({
  head,
  headLayout = 'title-only',
  headTitle,
  headAction,
  items,
  onItemClick,
  selectedId,
  emptyText = '暂无数据',
  titleEllipsis = true,
  descEllipsis = true,
  showIndex = false,
  style,
  highlightKeywords,
  loop = false,
}: PanelListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const focusedIndexRef = useRef<number>(-1);

  const scrollToItem = useCallback((id: string | number) => {
    const itemElement = itemRefs.current.get(id);
    const contentElement = listRef.current?.querySelector('.panel-list-content');

    if (itemElement && contentElement) {
      const contentRect = contentElement.getBoundingClientRect();
      const itemRect = itemElement.getBoundingClientRect();

      if (itemRect.top < contentRect.top) {
        itemElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } else if (itemRect.bottom > contentRect.bottom) {
        itemElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
      }
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (items.length === 0) return;

      const currentIndex =
        focusedIndexRef.current >= 0
          ? focusedIndexRef.current
          : selectedId !== undefined
            ? items.findIndex(item => item.id === selectedId)
            : -1;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex >= items.length - 1 && !loop) return;
          const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          focusedIndexRef.current = nextIndex;
          const nextItem = items[nextIndex];
          scrollToItem(nextItem.id);
          onItemClick?.(nextItem);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex <= 0 && !loop) return;
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          focusedIndexRef.current = prevIndex;
          const prevItem = items[prevIndex];
          scrollToItem(prevItem.id);
          onItemClick?.(prevItem);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (currentIndex >= 0 && currentIndex < items.length) {
            onItemClick?.(items[currentIndex]);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          focusedIndexRef.current = -1;
          break;
        }
      }
    },
    [items, selectedId, onItemClick, scrollToItem, loop]
  );

  const itemsKey = useMemo(() => items.map(i => i.id).join(','), [items]);

  useEffect(() => {
    focusedIndexRef.current = -1;
    itemRefs.current.clear();
  }, [itemsKey]);

  useEffect(() => {
    if (selectedId !== undefined) {
      focusedIndexRef.current = items.findIndex(item => item.id === selectedId);
    }
  }, [selectedId, items]);

  const handleItemClick = useCallback(
    (item: PanelListItem, index: number) => {
      focusedIndexRef.current = index;
      onItemClick?.(item);
    },
    [onItemClick]
  );

  const setItemRef = useCallback(
    (id: string | number) => (el: HTMLDivElement | null) => {
      if (el) {
        itemRefs.current.set(id, el);
      } else {
        itemRefs.current.delete(id);
      }
    },
    []
  );

  const renderHead = () => {
    if (head) {
      return <div className="panel-list-head">{head}</div>;
    }

    if (!headTitle && !headAction) {
      return null;
    }

    if (headLayout === 'title-only') {
      return (
        <div className="panel-list-head">
          <div className="panel-list-head-title">{headTitle}</div>
        </div>
      );
    }

    if (headLayout === 'button-only') {
      return (
        <div className="panel-list-head panel-list-head-center">
          <div className="panel-list-head-action">{headAction}</div>
        </div>
      );
    }

    return (
      <div className="panel-list-head">
        <div className="panel-list-head-title">{headTitle}</div>
        <div className="panel-list-head-action">{headAction}</div>
      </div>
    );
  };

  const headElement = renderHead();
  const isFixed = style && (style.height !== undefined || style.maxHeight !== undefined);

  return (
    <div
      ref={listRef}
      className={`panel-list ${isFixed ? 'panel-list-fixed' : ''}`}
      style={style}
      tabIndex={items.length > 0 ? 0 : undefined}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label="列表"
    >
      {headElement}
      <div className="panel-list-content">
        {items.length === 0 ? (
          <div className="panel-list-empty">{emptyText}</div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              ref={setItemRef(item.id)}
              className={`panel-list-item ${selectedId === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item, index)}
              role="option"
              aria-selected={selectedId === item.id}
            >
              {showIndex && <span className="panel-list-item-index">{index + 1}.</span>}
              <span className="panel-list-item-content">
                <div className={`panel-list-item-title ${titleEllipsis ? 'ellipsis' : ''}`}>
                  {highlightKeywords ? (
                    <HighlightText text={item.title} highlight={highlightKeywords[0]} />
                  ) : (
                    item.title
                  )}
                </div>
                {item.description && (
                  <div className={`panel-list-item-desc ${descEllipsis ? 'ellipsis' : ''}`}>
                    {highlightKeywords ? (
                      <HighlightText text={item.description} highlight={highlightKeywords[0]} />
                    ) : (
                      item.description
                    )}
                  </div>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
