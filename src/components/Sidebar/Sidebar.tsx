import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { SidebarProps, SidebarItem, SubmenuMode, CollapseBehavior } from './types';
import { useSidebarExpand } from './useSidebarExpand';
import { usePopoverPosition } from './usePopoverPosition';
import './Sidebar.css';

const DEFAULT_ANIMATION_DURATION = 200;
const DEFAULT_COLLAPSE_BEHAVIOR: CollapseBehavior = 'preserve';

function getGlobalSubmenuMode(items: SidebarItem[]): SubmenuMode {
  const submenuModes = items
    .filter(item => item.submenu && item.submenu.length > 0)
    .map(item => item.submenuMode || 'mixed');

  if (submenuModes.length === 0) return 'mixed';
  if (submenuModes.every(mode => mode === 'inline')) return 'inline';
  if (submenuModes.every(mode => mode === 'popover')) return 'popover';
  return 'mixed';
}

export function Sidebar({
  title,
  collapsed,
  onToggle,
  items,
  activeId,
  topItems,
  footerItems,
  navAlign = 'top',
  collapseBehavior = DEFAULT_COLLAPSE_BEHAVIOR,
  animationDuration = DEFAULT_ANIMATION_DURATION,
}: SidebarProps) {
  const allItems = [...items, ...(topItems || []), ...(footerItems || [])];
  const globalSubmenuMode = getGlobalSubmenuMode(allItems);

  const { toggleExpand, isExpanded } = useSidebarExpand(
    collapsed,
    globalSubmenuMode,
    collapseBehavior
  );

  const { popoverPosition, popoverRef, togglePopover, closePopover, isPopoverOpen } =
    usePopoverPosition();

  const getSelectedChildText = (item: SidebarItem): string | null => {
    if (!item.submenu) return null;
    const selectedChild = item.submenu.find(child => child.selected);
    return selectedChild ? selectedChild.text : null;
  };

  const getDisplayText = (item: SidebarItem, hasSubmenu: boolean, expanded: boolean): string => {
    if (!hasSubmenu) return item.text;

    if (!expanded && item.showSelectedChildWhenCollapsed) {
      const selectedChildText = getSelectedChildText(item);
      return selectedChildText || item.label || item.text;
    }

    return item.label || item.text;
  };

  const getItemClassName = (item: SidebarItem, isNavActive: boolean): string => {
    const isToggle = item.type === 'toggle';
    const isRadio = item.type === 'radio';

    return [
      'sidebar-item',
      isToggle ? 'sidebar-item-toggle' : '',
      isRadio ? 'sidebar-item-radio' : '',
      !isToggle && !isRadio && (item.selected || isNavActive) ? 'active' : '',
      isToggle && item.checked ? 'checked' : '',
      isRadio && item.selected ? 'selected' : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  const renderSubmenuItem = (child: SidebarItem) => {
    const className = getItemClassName(child, false);
    return (
      <div key={child.id} className={`${className} sidebar-submenu-item`} onClick={child.onClick}>
        <span className="sidebar-item-icon"></span>
        <span className="sidebar-item-text">{child.text}</span>
      </div>
    );
  };

  const renderPopoverItem = (child: SidebarItem) => {
    const isToggle = child.type === 'toggle';
    const isRadio = child.type === 'radio';

    const className = [
      'sidebar-popover-item',
      isToggle ? 'sidebar-popover-toggle' : '',
      isRadio ? 'sidebar-popover-radio' : '',
      !isToggle && !isRadio && child.selected ? 'active' : '',
      isToggle && child.checked ? 'checked' : '',
      isRadio && child.selected ? 'selected' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={child.id}
        className={className}
        onClick={() => {
          child.onClick?.();
          closePopover();
        }}
      >
        <span className="sidebar-popover-icon"></span>
        <span className="sidebar-popover-text">{child.text}</span>
      </div>
    );
  };

  const renderItem = (item: SidebarItem, isNavActive?: boolean) => {
    if (item.divider) {
      return <div key={item.id} className="sidebar-divider-item" />;
    }

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const expanded = isExpanded(item.id);
    const showPopover = isPopoverOpen(item.id);
    const displayText = getDisplayText(item, !!hasSubmenu, expanded);
    const submenuMode = item.submenuMode || 'mixed';

    const usePopover = submenuMode === 'popover' || (submenuMode === 'mixed' && collapsed);
    const useInline = submenuMode === 'inline' || submenuMode === 'mixed';

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasSubmenu) {
        if (usePopover) {
          togglePopover(item.id, e.currentTarget);
        } else if (useInline) {
          toggleExpand(item.id);
        }
      } else if (item.onClick) {
        item.onClick();
      }
    };

    const showPopoverMenu = hasSubmenu && showPopover && usePopover;

    const itemClassName = getItemClassName(item, isNavActive ?? false);

    return (
      <div key={item.id} className="sidebar-item-group">
        <div className={itemClassName} onClick={handleClick}>
          <span className="sidebar-item-icon">
            {hasSubmenu ? (
              expanded || showPopover ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )
            ) : (
              item.icon
            )}
          </span>
          <span className="sidebar-item-text">{displayText}</span>
        </div>

        {hasSubmenu && useInline && (
          <div className={`sidebar-submenu ${expanded ? 'expanded' : ''}`}>
            <div>{item.submenu!.map(child => renderSubmenuItem(child))}</div>
          </div>
        )}

        {showPopoverMenu && (
          <div
            ref={popoverRef}
            className="sidebar-popover"
            style={{ top: popoverPosition.top, left: popoverPosition.left }}
          >
            {item.submenu!.map(child => renderPopoverItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={
        {
          '--sidebar-transition-duration': `${animationDuration}ms`,
          '--submenu-animation-duration': `${animationDuration}ms`,
        } as React.CSSProperties
      }
    >
      <div className="sidebar-header">
        <h1>{title}</h1>
        <button type="button" className="sidebar-toggle-btn" onClick={onToggle}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>
      {topItems && topItems.length > 0 && (
        <>
          <div className="sidebar-top">
            {topItems.map(item => renderItem(item, item.id === activeId))}
          </div>
          <div className="sidebar-section-divider" />
        </>
      )}
      <nav className={`sidebar-nav nav-align-${navAlign}`}>
        {items.map(item => renderItem(item, item.id === activeId))}
      </nav>
      {footerItems && footerItems.length > 0 && (
        <>
          <div className="sidebar-section-divider" />
          <div className="sidebar-footer">
            {footerItems.map(item => renderItem(item, item.id === activeId))}
          </div>
        </>
      )}
    </aside>
  );
}

export type { SidebarItem, SidebarProps } from './types';
export type { SubmenuMode, ItemType, NavAlign, CollapseBehavior } from './types';
