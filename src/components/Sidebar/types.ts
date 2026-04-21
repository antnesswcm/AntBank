import { ReactNode } from 'react';

export type SubmenuMode = 'popover' | 'inline' | 'mixed';
export type ItemType = 'nav' | 'toggle' | 'radio';
export type NavAlign = 'top' | 'center' | 'bottom';
export type CollapseBehavior = 'preserve' | 'reset';

export interface SidebarItem {
  id: string;
  text: string;
  icon?: ReactNode;
  label?: string;
  type?: ItemType;
  selected?: boolean;
  checked?: boolean;
  radioGroup?: string;
  submenu?: SidebarItem[];
  submenuMode?: SubmenuMode;
  showSelectedChildWhenCollapsed?: boolean;
  onClick?: () => void;
  divider?: boolean;
}

export interface SidebarProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  items: SidebarItem[];
  activeId?: string;
  topItems?: SidebarItem[];
  footerItems?: SidebarItem[];
  navAlign?: NavAlign;
  collapseBehavior?: CollapseBehavior;
  animationDuration?: number;
}
