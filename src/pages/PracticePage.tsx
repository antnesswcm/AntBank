import { useState, useEffect } from 'react';
import {
  PageHeader,
  PanelList,
  Button,
  QuestionCard,
  AnswerCard,
  ConfirmDialog,
} from '../components';
import { Question, getCorrectOptionIds, getOptionLetter } from '../types';
import { useBankContext, useSettings } from '../stores';
import './PracticePage.css';

export function PracticePage() {
  const { activeBank } = useBankContext();
  const { settings } = useSettings();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerResults, setAnswerResults] = useState<Map<number, 'correct' | 'wrong'>>(new Map());
  const [answerSelections, setAnswerSelections] = useState<Map<number, string[]>>(new Map());
  const [practiceResults, setPracticeResults] = useState<{
    correct: number;
    wrong: number;
    unanswered: number;
    total: number;
    time: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const startPractice = (category: number | null = null) => {
    if (!activeBank) return;

    let questions: Question[] = [];
    if (category !== null) {
      const chapter = activeBank.chapters.find(ch => ch.id === category);
      questions = chapter?.questions || [];
    } else {
      activeBank.chapters.forEach(ch => {
        questions.push(...ch.questions);
      });
    }
    if (settings.randomOrder) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }
    setPracticeQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowAnswer(false);
    setPracticeResults(null);
    setAnswerResults(new Map());
    setAnswerSelections(new Map());
    setSelectedCategory(category);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleAnswer = (answer: string) => {
    if (showAnswer) return;
    if (answerResults.has(currentQuestionIndex)) return;

    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const correctOptionIds = getCorrectOptionIds(currentQuestion);
    const isMultipleChoice = correctOptionIds.length > 1;

    if (isMultipleChoice) {
      setSelectedAnswers(prev => {
        if (prev.includes(answer)) {
          return prev.filter(l => l !== answer);
        } else {
          return [...prev, answer];
        }
      });
    } else {
      setSelectedAnswers([answer]);
      if (settings.autoShowAnswer) {
        setShowAnswer(true);
        const correctLetters = correctOptionIds.map(id => getOptionLetter(id));
        const isCorrect = correctLetters.includes(answer.toUpperCase());
        setAnswerResults(prev => {
          const newMap = new Map(prev);
          newMap.set(currentQuestionIndex, isCorrect ? 'correct' : 'wrong');
          return newMap;
        });
        setAnswerSelections(prev => {
          const newMap = new Map(prev);
          newMap.set(currentQuestionIndex, [answer]);
          return newMap;
        });
      }
    }
  };

  const submitAnswer = () => {
    if (answerResults.has(currentQuestionIndex)) return;

    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const correctOptionIds = getCorrectOptionIds(currentQuestion);
    const correctLetters = correctOptionIds.map(id => getOptionLetter(id));
    const isCorrect =
      selectedAnswers.length === correctLetters.length &&
      selectedAnswers.every(ans => correctLetters.includes(ans.toUpperCase()));

    setShowAnswer(true);
    setAnswerResults(prev => {
      const newMap = new Map(prev);
      newMap.set(currentQuestionIndex, isCorrect ? 'correct' : 'wrong');
      return newMap;
    });
    setAnswerSelections(prev => {
      const newMap = new Map(prev);
      newMap.set(currentQuestionIndex, [...selectedAnswers]);
      return newMap;
    });
  };

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= practiceQuestions.length) return;

    setCurrentQuestionIndex(index);

    if (answerResults.has(index)) {
      const savedSelections = answerSelections.get(index) || [];
      setSelectedAnswers(savedSelections);
      setShowAnswer(true);
    } else {
      setSelectedAnswers([]);
      setShowAnswer(false);
    }
  };

  const nextQuestion = () => {
    goToQuestion(currentQuestionIndex + 1);
  };

  const prevQuestion = () => {
    goToQuestion(currentQuestionIndex - 1);
  };

  const finishPractice = () => {
    const unansweredCount = practiceQuestions.length - answerResults.size;

    if (unansweredCount > 0) {
      setConfirmDialogMessage(`还有 ${unansweredCount} 道题目未作答，确定要交卷吗？`);
      setShowConfirmDialog(true);
      return;
    }

    submitPractice();
  };

  const submitPractice = () => {
    const correctCount = Array.from(answerResults.values()).filter(r => r === 'correct').length;
    const wrongCount = Array.from(answerResults.values()).filter(r => r === 'wrong').length;
    const unansweredCount = practiceQuestions.length - answerResults.size;

    setPracticeResults({
      correct: correctCount,
      wrong: wrongCount,
      unanswered: unansweredCount,
      total: practiceQuestions.length,
      time: elapsedTime,
    });
    setStartTime(null);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    submitPractice();
  };

  const restartPractice = () => {
    setAnswerResults(new Map());
    startPractice(selectedCategory);
  };

  const exitPractice = () => {
    setPracticeQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowAnswer(false);
    setAnswerResults(new Map());
    setAnswerSelections(new Map());
  };

  if (practiceResults) {
    const { correct, wrong, unanswered, total, time } = practiceResults;
    const answered = correct + wrong;
    const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}分${secs}秒`;
    };

    return (
      <>
        <PageHeader title="刷题" />
        <div className="content-body">
          <div className="practice-summary">
            <div className="summary-header">
              <div className="summary-icon">{percentage >= 60 ? '🎉' : '💪'}</div>
              <div className="summary-title">{percentage >= 60 ? '恭喜完成！' : '继续加油！'}</div>
            </div>

            <div className="summary-stats-grid">
              <div className="stat-card">
                <div className="stat-value">{total}</div>
                <div className="stat-label">总题数</div>
              </div>
              <div className="stat-card correct">
                <div className="stat-value">{correct}</div>
                <div className="stat-label">答对</div>
              </div>
              <div className="stat-card wrong">
                <div className="stat-value">{wrong}</div>
                <div className="stat-label">答错</div>
              </div>
            </div>

            <div className="summary-time-card">
              <span className="time-label">用时</span>
              <span className="time-value">{formatTime(time)}</span>
            </div>

            <div className="summary-percentage">
              <div className="percentage-label">正确率</div>
              <div className="percentage-bar">
                <div className="percentage-fill" style={{ width: `${percentage}%` }} />
              </div>
              <div className="percentage-value">{percentage}%</div>
            </div>

            {unanswered > 0 && (
              <div className="summary-warning">还有 {unanswered} 道题目未作答</div>
            )}

            <div className="summary-actions">
              <Button onClick={restartPractice}>重新刷题</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setPracticeResults(null);
                  exitPractice();
                }}
              >
                返回刷题
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!practiceQuestions.length) {
    return (
      <>
        <PageHeader title="刷题" />
        <div className="content-body">
          <PanelList
            headTitle="选择题库分类"
            items={[
              { id: 'all', title: '全部题目', description: `${activeBank?.meta.total} 题` },
              ...(activeBank?.chapters.map(ch => ({
                id: ch.id,
                title: ch.title,
                description: `${ch.total} 题`,
              })) || []),
            ]}
            onItemClick={item => {
              if (item.id === 'all') {
                startPractice(null);
              } else {
                startPractice(item.id as number);
              }
            }}
          />
        </div>
      </>
    );
  }

  const currentQuestion = practiceQuestions[currentQuestionIndex];

  return (
    <>
      <PageHeader title="刷题" />
      <div className="content-body">
        <div className="practice-layout">
          <div className="practice-sidebar">
            <AnswerCard
              total={practiceQuestions.length}
              currentIndex={currentQuestionIndex}
              answerResults={answerResults}
              onSelect={goToQuestion}
            />
          </div>
          <div className="practice-main">
            <div className="practice-actions">
              <div className="practice-actions-left">
                <Button
                  variant="secondary"
                  disabled={currentQuestionIndex === 0}
                  onClick={prevQuestion}
                >
                  上一题
                </Button>
                <Button
                  variant="secondary"
                  disabled={currentQuestionIndex >= practiceQuestions.length - 1}
                  onClick={nextQuestion}
                >
                  下一题
                </Button>
              </div>
              <div className="practice-actions-center">
                {!showAnswer ? (
                  <Button
                    onClick={submitAnswer}
                    disabled={selectedAnswers.length === 0 && currentQuestion.type !== 6}
                  >
                    {currentQuestion.type === 6 ? '查看答案' : '提交答案'}
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>下一题</Button>
                )}
              </div>
              <div className="practice-actions-right">
                <Button onClick={finishPractice}>交卷</Button>
                <Button variant="ghost" onClick={exitPractice}>
                  退出
                </Button>
              </div>
            </div>
            <div className="practice-card-wrapper">
              <QuestionCard
                question={currentQuestion}
                index={currentQuestionIndex}
                onOptionClick={handleAnswer}
                selectedAnswers={selectedAnswers}
                showAnswer={showAnswer}
                showAnalysis={settings.showAnalysis}
                showResult={showAnswer}
                disabled={answerResults.has(currentQuestionIndex)}
              />
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showConfirmDialog}
        title="确认交卷"
        message={confirmDialogMessage}
        confirmText="交卷"
        cancelText="继续答题"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}
