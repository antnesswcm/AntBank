import { useState, useMemo, useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import { PageHeader, Button, SelectableList } from '../components';
import type { SelectableItem } from '../components';
import { useBankContext } from '../stores';
import './BankManagerPage.css';

export function BankManagerPage() {
  const { availableBanks, loadedBanks, service } = useBankContext();

  const loadedIds = useMemo(() => new Set(loadedBanks.map(lb => lb.id)), [loadedBanks]);

  const [selectedBankIds, setSelectedBankIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedBankIds(loadedIds);
  }, [loadedIds]);

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

  const saveChanges = async () => {
    setLoading(true);
    setError(null);

    const toUnload = loadedBanks.filter(lb => !selectedBankIds.has(lb.id));
    const toLoad = availableBanks.filter(b => selectedBankIds.has(b.id) && !loadedIds.has(b.id));

    for (const bank of toLoad) {
      try {
        await service.loadToActive(bank);
      } catch (err) {
        setError(`加载题库 "${bank.title}" 失败: ${err}`);
      }
    }

    for (const lb of toUnload) {
      try {
        service.unloadFromActive(lb.id);
      } catch (err) {
        setError(`卸载题库失败: ${err}`);
      }
    }

    setLoading(false);
  };

  const hasChanges = useMemo(() => {
    const currentLoaded = loadedIds;
    const newSelected = selectedBankIds;
    if (currentLoaded.size !== newSelected.size) return true;
    for (const id of currentLoaded) {
      if (!newSelected.has(id)) return true;
    }
    return false;
  }, [loadedIds, selectedBankIds]);

  return (
    <>
      <PageHeader title="题库管理" />
      <div className="content-body">
        <div className="bank-manager-container">
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
            emptyText="暂无题库，请点击导入按钮添加题库文件"
          />

          <Button size="large" onClick={saveChanges} disabled={!hasChanges || loading}>
            {loading ? '保存中...' : '保存'}
          </Button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </>
  );
}
