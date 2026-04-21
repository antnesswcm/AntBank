import { createContext, useContext, useReducer, useMemo, ReactNode, useEffect } from 'react';
import { createBankService, BankService } from '../services';
import type { QuestionBank, BankListItem, LoadedBank } from '../types';

interface BankState {
  availableBanks: BankListItem[];
  loadedBanks: LoadedBank[];
  activeBankId: string | null;
  hasCompletedWelcome: boolean;
}

export type BankAction =
  | { type: 'SET_AVAILABLE_BANKS'; banks: BankListItem[] }
  | { type: 'ADD_AVAILABLE_BANK'; bank: BankListItem }
  | { type: 'REMOVE_AVAILABLE_BANK'; id: string }
  | { type: 'LOAD_BANK'; id: string; bank: QuestionBank }
  | { type: 'UNLOAD_BANK'; id: string }
  | { type: 'SET_ACTIVE_BANK'; id: string }
  | { type: 'COMPLETE_WELCOME' };

interface BankContextValue {
  state: BankState;
  availableBanks: BankListItem[];
  loadedBanks: LoadedBank[];
  activeBankId: string | null;
  activeBank: QuestionBank | null;
  hasCompletedWelcome: boolean;
  service: BankService;
}

const BankContext = createContext<BankContextValue | null>(null);

function bankReducer(state: BankState, action: BankAction): BankState {
  switch (action.type) {
    case 'SET_AVAILABLE_BANKS':
      return { ...state, availableBanks: action.banks };

    case 'ADD_AVAILABLE_BANK':
      return { ...state, availableBanks: [...state.availableBanks, action.bank] };

    case 'REMOVE_AVAILABLE_BANK': {
      const newAvailableBanks = state.availableBanks.filter(b => b.id !== action.id);
      const newLoadedBanks = state.loadedBanks.filter(b => b.id !== action.id);
      const newActiveId =
        state.activeBankId === action.id ? newLoadedBanks[0]?.id || null : state.activeBankId;
      return {
        ...state,
        availableBanks: newAvailableBanks,
        loadedBanks: newLoadedBanks,
        activeBankId: newActiveId,
      };
    }

    case 'LOAD_BANK': {
      return {
        ...state,
        loadedBanks: [...state.loadedBanks, { id: action.id, bank: action.bank }],
        activeBankId: state.activeBankId || action.id,
      };
    }

    case 'UNLOAD_BANK': {
      const newLoadedBanks = state.loadedBanks.filter(b => b.id !== action.id);
      const newActiveId =
        state.activeBankId === action.id ? newLoadedBanks[0]?.id || null : state.activeBankId;
      return {
        ...state,
        loadedBanks: newLoadedBanks,
        activeBankId: newActiveId,
      };
    }

    case 'SET_ACTIVE_BANK':
      return { ...state, activeBankId: action.id };

    case 'COMPLETE_WELCOME':
      return { ...state, hasCompletedWelcome: true };

    default:
      return state;
  }
}

export function BankProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bankReducer, {
    availableBanks: [],
    loadedBanks: [],
    activeBankId: null,
    hasCompletedWelcome: false,
  });

  const service = useMemo(() => createBankService(dispatch), [dispatch]);

  useEffect(() => {
    service.loadAvailableBanks();
  }, [service]);

  const activeBank = useMemo(() => {
    if (!state.activeBankId) return null;
    const loaded = state.loadedBanks.find(b => b.id === state.activeBankId);
    return loaded?.bank || null;
  }, [state.loadedBanks, state.activeBankId]);

  const value = useMemo(
    () => ({
      state,
      availableBanks: state.availableBanks,
      loadedBanks: state.loadedBanks,
      activeBankId: state.activeBankId,
      activeBank,
      hasCompletedWelcome: state.hasCompletedWelcome,
      service,
    }),
    [state, activeBank, service]
  );

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBankContext() {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBankContext must be used within a BankProvider');
  }
  return context;
}
