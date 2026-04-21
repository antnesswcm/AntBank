import { useState } from 'react';
import { ViewType } from './types';
import { Sidebar } from './components';
import type { SidebarItem } from './components/Sidebar';
import {
  WelcomePage,
  BrowsePage,
  SearchPage,
  PracticePage,
  SettingsPage,
  BankManagerPage,
} from './pages';
import { useBankContext, useSettings } from './stores';
import './App.css';

function App() {
  const { availableBanks, loadedBanks, activeBankId, activeBank, service, hasCompletedWelcome } =
    useBankContext();

  const { settings, setAlwaysOnTop } = useSettings();

  const [currentView, setCurrentView] = useState<ViewType>('browse');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const selectBank = (id: string) => {
    service.switchActive(id);
    setCurrentView('browse');
  };

  const renderContent = () => {
    if (!hasCompletedWelcome) {
      return <WelcomePage />;
    }

    if (currentView === 'bankManager') {
      return <BankManagerPage />;
    }

    if (!activeBank) {
      return null;
    }

    switch (currentView) {
      case 'browse':
        return <BrowsePage questionBank={activeBank} settings={settings} />;
      case 'search':
        return <SearchPage loadedBanks={loadedBanks} settings={settings} />;
      case 'practice':
        return <PracticePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  const getNavItems = (): SidebarItem[] => {
    const items: SidebarItem[] = [];

    if (loadedBanks.length > 0) {
      items.push({
        id: 'banks',
        icon: <span>📖</span>,
        text: '切换题库',
        label: '切换题库',
        showSelectedChildWhenCollapsed: true,
        submenuMode: 'mixed',
        submenu: loadedBanks.map(lb => ({
          id: `bank-${lb.id}`,
          text: lb.bank.meta.title,
          type: 'radio' as const,
          radioGroup: 'banks',
          selected: activeBankId === lb.id,
          onClick: () => selectBank(lb.id),
        })),
      });
    }

    if (activeBank) {
      items.push(
        {
          id: 'browse',
          icon: <span>🏠</span>,
          text: '题库浏览',
          onClick: () => setCurrentView('browse'),
        },
        {
          id: 'practice',
          icon: <span>✏️</span>,
          text: '刷题',
          onClick: () => setCurrentView('practice'),
        },
        {
          id: 'search',
          icon: <span>🔍</span>,
          text: '搜索题目',
          onClick: () => setCurrentView('search'),
        }
      );
    }

    return items;
  };

  const getFooterItems = (): SidebarItem[] => {
    const items: SidebarItem[] = [];

    items.push({
      id: 'bankManager',
      icon: <span>📚</span>,
      text: '题库管理',
      onClick: () => setCurrentView('bankManager'),
    });

    items.push({ id: 'divider', divider: true, text: '' });

    items.push({
      id: 'alwaysOnTop',
      icon: <span className="pin-icon">📌</span>,
      text: '置顶窗口',
      type: 'toggle',
      checked: settings.alwaysOnTop,
      onClick: () => setAlwaysOnTop(!settings.alwaysOnTop),
    });

    items.push({
      id: 'settings',
      icon: <span>⚙️</span>,
      text: '设置',
      onClick: () => setCurrentView('settings'),
    });

    return items;
  };

  return (
    <div className="app">
      {hasCompletedWelcome && availableBanks.length > 0 && (
        <Sidebar
          title="Ant题库"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          items={getNavItems()}
          activeId={currentView}
          footerItems={getFooterItems()}
        />
      )}
      <main className="content">{renderContent()}</main>
    </div>
  );
}

export default App;
