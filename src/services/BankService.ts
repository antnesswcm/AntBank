import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { QuestionBank, BuiltInBank, BankListItem } from '../types';
import type { BankAction } from '../stores';

export function createBankService(dispatch: React.Dispatch<BankAction>) {
  const loadAvailableBanks = async () => {
    try {
      const builtin = await invoke<BuiltInBank[]>('get_builtin_banks');
      const banks: BankListItem[] = builtin.map(b => ({
        id: `builtin-${b.slug}`,
        title: b.title,
        slug: b.slug,
        total: b.total,
        isBuiltin: true,
        filename: b.filename,
      }));
      dispatch({ type: 'SET_AVAILABLE_BANKS', banks });
    } catch {
      dispatch({ type: 'SET_AVAILABLE_BANKS', banks: [] });
    }
  };

  const importToAvailable = async (): Promise<BankListItem[]> => {
    const selected = await open({
      multiple: true,
      filters: [{ name: '题库文件', extensions: ['json'] }],
    });

    if (!selected) return [];

    const paths = Array.isArray(selected) ? selected : [selected];
    const banks: BankListItem[] = [];

    for (const path of paths) {
      if (typeof path === 'string') {
        try {
          const data = await invoke<QuestionBank>('load_question_bank', { path });
          const bank: BankListItem = {
            id: `imported-${data.meta.slug}-${Date.now()}`,
            title: data.meta.title,
            slug: data.meta.slug,
            total: data.meta.total,
            isBuiltin: false,
            path,
          };
          dispatch({ type: 'ADD_AVAILABLE_BANK', bank });
          banks.push(bank);
        } catch (err) {
          console.error(`Failed to import bank from ${path}:`, err);
        }
      }
    }

    return banks;
  };

  const removeFromAvailable = (id: string) => {
    dispatch({ type: 'REMOVE_AVAILABLE_BANK', id });
  };

  const loadToActive = async (bank: BankListItem): Promise<boolean> => {
    try {
      let data: QuestionBank;

      if (bank.isBuiltin && bank.filename) {
        data = await invoke<QuestionBank>('load_builtin_bank', { filename: bank.filename });
      } else if (bank.path) {
        data = await invoke<QuestionBank>('load_question_bank', { path: bank.path });
      } else {
        return false;
      }

      dispatch({ type: 'LOAD_BANK', id: bank.id, bank: data });
      return true;
    } catch (err) {
      console.error(`Failed to load bank ${bank.slug}:`, err);
      return false;
    }
  };

  const unloadFromActive = (id: string) => {
    dispatch({ type: 'UNLOAD_BANK', id });
  };

  const switchActive = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_BANK', id });
  };

  const completeWelcome = () => {
    dispatch({ type: 'COMPLETE_WELCOME' });
  };

  return {
    loadAvailableBanks,
    importToAvailable,
    removeFromAvailable,
    loadToActive,
    unloadFromActive,
    switchActive,
    completeWelcome,
  };
}

export type BankService = ReturnType<typeof createBankService>;
