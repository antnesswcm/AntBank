import { ReactNode } from 'react';
import { Button } from './Button';
import './SelectableList.css';

export interface SelectableItem {
  id: string;
  title: string;
  badge?: ReactNode;
  suffix?: ReactNode;
  selectable?: boolean;
}

interface SelectableListProps {
  title?: string;
  items: SelectableItem[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  primaryActionIcon?: ReactNode;
  emptyText?: string;
  showSelectionCount?: boolean;
}

export function SelectableList({
  title = '列表',
  items,
  selectedIds,
  onSelect,
  onSelectAll,
  onDeselectAll,
  onPrimaryAction,
  primaryActionLabel = '操作',
  primaryActionIcon,
  emptyText = '暂无内容',
  showSelectionCount = true,
}: SelectableListProps) {
  const selectedCount = selectedIds.size;
  const hasSelectActions = onSelectAll && onDeselectAll;
  const selectableItems = items.filter(item => item.selectable !== false);
  const selectableCount = selectableItems.length;

  return (
    <div className="selectable-list">
      <div className="selectable-list-header">
        <span className="selectable-list-header-title">
          {title}
          {selectableCount > 0 && showSelectionCount && (
            <span className="selectable-list-count-badge">已选{selectedCount}个</span>
          )}
        </span>
        <div className="selectable-list-actions">
          {selectableCount > 0 && hasSelectActions && (
            <>
              <Button variant="ghost" size="small" onClick={onSelectAll}>
                全选
              </Button>
              <Button variant="ghost" size="small" onClick={onDeselectAll}>
                取消
              </Button>
            </>
          )}
          {onPrimaryAction && (
            <Button
              variant="primary"
              size="small"
              onClick={onPrimaryAction}
              icon={primaryActionIcon}
            >
              {primaryActionLabel}
            </Button>
          )}
        </div>
      </div>
      {items.length > 0 ? (
        <div className="selectable-list-items">
          {items.map(item => {
            const isSelectable = item.selectable !== false;
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`selectable-list-item ${isSelected ? 'selected' : ''} ${!isSelectable ? 'non-selectable' : ''}`}
                onClick={() => isSelectable && onSelect(item.id)}
              >
                {isSelectable && (
                  <div className="selectable-list-checkbox">{isSelected ? '☑' : '☐'}</div>
                )}
                <div className="selectable-list-info">
                  <span className="selectable-list-title">{item.title}</span>
                </div>
                {item.badge && <span className="selectable-list-badge">{item.badge}</span>}
                {item.suffix && <div className="selectable-list-suffix">{item.suffix}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="selectable-list-empty">
          <p>{emptyText}</p>
        </div>
      )}
    </div>
  );
}
