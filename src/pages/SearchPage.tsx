import { PageLayout, PanelList, QuestionCard, SplitPane, BankSelect } from '../components';
import type { BankOption } from '../components/BankSelect';
import type { LoadedBank, Settings } from '../types';
import { useSearch } from '../hooks';
import './SearchPage.css';

export interface SearchPageProps {
  loadedBanks: LoadedBank[];
  settings: Settings;
}

export function SearchPage({ loadedBanks, settings }: SearchPageProps) {
  const {
    query,
    setQuery,
    scopes,
    setScopes,
    selectedBankId,
    setSelectedBankId,
    results,
    selectedResultIndex,
    setSelectedResultIndex,
  } = useSearch(loadedBanks);

  const bankOptions: BankOption[] = loadedBanks.map(lb => ({
    slug: lb.id,
    title: lb.bank.meta.title,
  }));

  return (
    <PageLayout title="题目搜索">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="输入关键字搜索所有题库..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && <span className="search-results">{results.length} 个结果</span>}
        </div>
        <BankSelect banks={bankOptions} value={selectedBankId} onChange={setSelectedBankId} />
        <div className="search-scopes">
          <label className={scopes.content ? 'active' : ''}>
            <input
              type="checkbox"
              checked={scopes.content}
              onChange={e => setScopes({ ...scopes, content: e.target.checked })}
            />
            <span>题干</span>
          </label>
          <label className={scopes.options ? 'active' : ''}>
            <input
              type="checkbox"
              checked={scopes.options}
              onChange={e => setScopes({ ...scopes, options: e.target.checked })}
            />
            <span>选项</span>
          </label>
          <label className={scopes.analysis ? 'active' : ''}>
            <input
              type="checkbox"
              checked={scopes.analysis}
              onChange={e => setScopes({ ...scopes, analysis: e.target.checked })}
            />
            <span>解析</span>
          </label>
        </div>
      </div>
      {results.length === 1 ? (
        <QuestionCard
          question={results[0].question}
          chapterTitle={`${results[0].bankTitle} - ${results[0].chapterTitle}`}
          index={results[0].index}
          showAnalysis={settings.showAnalysis}
          highlightKeyword={query}
        />
      ) : (
        <SplitPane
          defaultLeftWidth={320}
          minLeftWidth={200}
          minRightWidth={400}
          left={
            <PanelList
              items={results.map((result, idx) => ({
                id: idx,
                title:
                  result.question.content.length > 50
                    ? result.question.content.substring(0, 50) + '...'
                    : result.question.content,
                description: `${result.bankTitle} - ${result.chapterTitle}`,
              }))}
              selectedId={selectedResultIndex ?? undefined}
              onItemClick={item => setSelectedResultIndex(item.id as number)}
              showIndex
              highlightKeywords={query ? [query] : undefined}
            />
          }
          right={
            selectedResultIndex !== null && results[selectedResultIndex] ? (
              <QuestionCard
                question={results[selectedResultIndex].question}
                chapterTitle={`${results[selectedResultIndex].bankTitle} - ${results[selectedResultIndex].chapterTitle}`}
                index={results[selectedResultIndex].index}
                showAnalysis={settings.showAnalysis}
                highlightKeyword={query}
              />
            ) : (
              <div className="detail-empty">请选择左侧结果查看详情</div>
            )
          }
        />
      )}
    </PageLayout>
  );
}
