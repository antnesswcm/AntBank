import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  PageLayout,
  PanelList,
  Button,
  QuestionCard,
  SplitPane,
  MetaCard,
  MetaItem,
} from '../components';
import type { QuestionBank, Chapter, Settings } from '../types';
import './BrowsePage.css';

export interface BrowsePageProps {
  questionBank: QuestionBank;
  settings: Settings;
}

export function BrowsePage({ questionBank, settings }: BrowsePageProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const handleSelectChapter = (chapter: Chapter | null) => {
    setSelectedChapter(chapter);
    setExpandedQuestion(null);
  };

  const handleBackToCategories = () => {
    setSelectedChapter(null);
    setExpandedQuestion(null);
  };

  if (selectedChapter) {
    return (
      <PageLayout title="题库浏览">
        <SplitPane
          defaultLeftWidth={320}
          minLeftWidth={200}
          minRightWidth={400}
          left={
            <PanelList
              headLayout="title-button"
              headTitle={selectedChapter.title}
              headAction={
                <Button
                  variant="secondary"
                  size="small"
                  icon={<ArrowLeft size={14} />}
                  onClick={handleBackToCategories}
                >
                  返回分类
                </Button>
              }
              items={selectedChapter.questions.map((q, idx) => ({
                id: idx,
                title: q.content,
              }))}
              selectedId={expandedQuestion ?? undefined}
              onItemClick={item =>
                setExpandedQuestion(
                  expandedQuestion === (item.id as number) ? null : (item.id as number)
                )
              }
              showIndex
            />
          }
          right={
            expandedQuestion !== null ? (
              <QuestionCard
                question={selectedChapter.questions[expandedQuestion]}
                index={expandedQuestion}
                showAnalysis={settings.showAnalysis}
              />
            ) : (
              <div className="detail-empty">请选择左侧题目查看详情</div>
            )
          }
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="题库浏览">
      <MetaCard title={questionBank.meta.title}>
        <MetaItem label="总题数" value={questionBank.meta.total} />
        <MetaItem label="分类数" value={questionBank.chapters.length} />
        <MetaItem
          label="更新时间"
          value={new Date(questionBank.meta.created_at).toLocaleDateString()}
        />
      </MetaCard>
      <PanelList
        headTitle="题库分类"
        items={questionBank.chapters.map(ch => ({
          id: ch.id,
          title: ch.title,
          description: `${ch.total} 题`,
        }))}
        onItemClick={item => {
          const chapter = questionBank.chapters.find(ch => ch.id === item.id);
          if (chapter) {
            handleSelectChapter(chapter);
          }
        }}
      />
    </PageLayout>
  );
}
