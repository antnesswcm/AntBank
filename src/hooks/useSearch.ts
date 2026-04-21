import { useState, useMemo } from 'react';
import type { LoadedBank, Question } from '../types';

export interface SearchResult {
  question: Question;
  chapterTitle: string;
  bankTitle: string;
  index: number;
}

export interface SearchScopes {
  content: boolean;
  options: boolean;
  analysis: boolean;
}

export function useSearch(loadedBanks: LoadedBank[]) {
  const [query, setQuery] = useState('');
  const [scopes, setScopes] = useState<SearchScopes>({
    content: true,
    options: true,
    analysis: true,
  });
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const searchResults: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    const banksToSearch = selectedBankId
      ? loadedBanks.filter(lb => lb.id === selectedBankId)
      : loadedBanks;

    banksToSearch.forEach(lb => {
      lb.bank.chapters.forEach(chapter => {
        chapter.questions.forEach((q, idx) => {
          let isMatch = false;

          if (scopes.content && q.content.toLowerCase().includes(queryLower)) {
            isMatch = true;
          }

          if (!isMatch && scopes.options) {
            for (const opt of q.options) {
              if (opt.content.toLowerCase().includes(queryLower)) {
                isMatch = true;
                break;
              }
            }
          }

          if (!isMatch && scopes.analysis && q.analysis?.toLowerCase().includes(queryLower)) {
            isMatch = true;
          }

          if (isMatch) {
            searchResults.push({
              question: q,
              chapterTitle: chapter.title,
              bankTitle: lb.bank.meta.title,
              index: idx,
            });
          }
        });
      });
    });

    return searchResults;
  }, [query, loadedBanks, scopes, selectedBankId]);

  return {
    query,
    setQuery,
    scopes,
    setScopes,
    selectedBankId,
    setSelectedBankId,
    results,
    selectedResultIndex,
    setSelectedResultIndex,
  };
}
