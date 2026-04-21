import { useState, useMemo } from 'react';
import { FolderOpen } from 'lucide-react';
import { PageHeader, Button, SelectableList } from '../components';
import type { SelectableItem } from '../components';
import { useBankContext } from '../stores';
import './WelcomePage.css';

export function WelcomePage() {
  const { availableBanks, service } = useBankContext();

  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectableItems = useMemo<SelectableItem[]>(() => {
    return availableBanks.map(bank => ({
      id: bank.id,
      title: bank.title,
      badge: bank.total > 0 ? `${bank.total}题` : undefined,
      suffix: bank.isBuiltin ? (
        <span className="bank-badge builtin">内置</span>
      ) : (
        <button
          className="bank-remove-btn"
          onClick={e => {
            e.stopPropagation();
            service.removeFromAvailable(bank.id);
          }}
        >
          ✕
        </button>
      ),
    }));
  }, [availableBanks, service]);

  const toggleBankSelection = (id: string) => {
    setSelectedBankIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllBanks = () => {
    setSelectedBankIds(new Set(availableBanks.map(b => b.id)));
  };

  const deselectAllBanks = () => {
    setSelectedBankIds(new Set());
  };

  const handleImport = async () => {
    try {
      const imported = await service.importToAvailable();
      if (imported.length > 0) {
        setSelectedBankIds(prev => {
          const newSet = new Set(prev);
          imported.forEach(b => newSet.add(b.id));
          return newSet;
        });
      }
    } catch (err) {
      setError(err as string);
    }
  };

  const loadSelectedBanks = async () => {
    if (selectedBankIds.size === 0) return;

    setLoading(true);
    setError(null);

    for (const bankId of selectedBankIds) {
      const bank = availableBanks.find(b => b.id === bankId);
      if (!bank) continue;

      try {
        await service.loadToActive(bank);
      } catch (err) {
        setError(`加载题库 "${bank.title}" 失败: ${err}`);
      }
    }

    service.completeWelcome();
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="欢迎使用 Ant 题库" />
      <div className="content-body">
        <div className="welcome-container">
          <img className="welcome-icon" src="/antbank.png" alt="Ant Bank" />
          <div className="welcome-title">请选择题库</div>

          <SelectableList
            title="题库列表"
            items={selectableItems}
            selectedIds={selectedBankIds}
            onSelect={toggleBankSelection}
            onSelectAll={selectAllBanks}
            onDeselectAll={deselectAllBanks}
            onPrimaryAction={handleImport}
            primaryActionLabel="导入"
            primaryActionIcon={<FolderOpen size={14} />}
            emptyText="暂无内置题库，请点击导入按钮添加题库文件"
          />

          <Button
            size="large"
            onClick={loadSelectedBanks}
            disabled={selectedBankIds.size === 0 || loading}
          >
            {loading ? '加载中...' : '开始'}
          </Button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </>
  );
}
