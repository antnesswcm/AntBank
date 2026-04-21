import type { Question } from '../types';
import { getCorrectOptionIds, formatAnswer, getOptionLetter } from '../types';
import { HighlightText } from './HighlightText';
import './QuestionCard.css';

export interface QuestionCardProps {
  question: Question;
  chapterTitle?: string;
  index?: number;
  showAnalysis?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  highlightKeyword?: string;
  showAnswer?: boolean;
  showOptions?: boolean;
  onOptionClick?: (letter: string) => void;
  selectedAnswers?: string[];
  showResult?: boolean;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  chapterTitle,
  index,
  showAnalysis = true,
  expanded = true,
  onClick,
  highlightKeyword,
  showAnswer = true,
  showOptions = true,
  onOptionClick,
  selectedAnswers = [],
  showResult = false,
  disabled = false,
}: QuestionCardProps) {
  const isComprehensive = question.type === 6;
  const isPracticeMode = onOptionClick !== undefined;

  const renderQuestionNumber = () => {
    if (isPracticeMode && index !== undefined) {
      return (
        <span className="question-number">
          第 {index + 1} 题
          {question.type_name && <span className="question-type-badge"> {question.type_name}</span>}
        </span>
      );
    }

    return (
      <>
        {chapterTitle && <div className="question-subbank">{chapterTitle}</div>}
        {index !== undefined && <span className="question-number">{index + 1}.</span>}
        {question.type_name && <span className="question-type-badge">{question.type_name}</span>}
      </>
    );
  };

  const renderOptions = () => {
    if (!question.options || question.options.length === 0) {
      return null;
    }

    const correctOptionIds = getCorrectOptionIds(question);

    return (
      <div className="question-options">
        {question.options.map(opt => {
          const letter = getOptionLetter(opt.id);
          const isSelected = selectedAnswers.includes(letter);
          const isCorrect = correctOptionIds.includes(opt.id);

          let optionClass = 'option-item';
          if (isPracticeMode) {
            if (showResult) {
              if (isCorrect) {
                optionClass += ' correct';
              } else if (isSelected && !isCorrect) {
                optionClass += ' incorrect';
              }
            } else if (isSelected) {
              optionClass += ' selected';
            }
            if (disabled) {
              optionClass += ' disabled';
            }
          } else if (showAnswer && isCorrect) {
            optionClass += ' correct';
          }

          return (
            <div
              key={opt.id}
              className={optionClass}
              onClick={() => !disabled && !showResult && onOptionClick?.(letter)}
            >
              <span className="option-letter">{letter}.</span>
              <span>
                {highlightKeyword ? (
                  <HighlightText
                    text={opt.content.replace(/^[．.]+/, '')}
                    highlight={highlightKeyword}
                  />
                ) : (
                  opt.content.replace(/^[．.]+/, '')
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderResult = () => {
    if (!isPracticeMode || !showResult) {
      return null;
    }

    const correctOptionIds = getCorrectOptionIds(question);
    const correctLetters = correctOptionIds.map(id => getOptionLetter(id));

    const isCorrect =
      selectedAnswers.length === correctLetters.length &&
      selectedAnswers.every(l => correctLetters.includes(l.toUpperCase()));

    const displayCorrectAnswer = formatAnswer(question);
    const displayMyAnswer = selectedAnswers.sort().join('');

    return (
      <div className={`practice-result ${!showAnswer ? 'hidden' : ''}`}>
        {!isComprehensive && selectedAnswers.length === 0 && (
          <div className="result-single">
            <span className="result-label">正确答案：</span>
            <span className="result-value correct">{displayCorrectAnswer}</span>
          </div>
        )}
        {!isComprehensive && selectedAnswers.length > 0 && (
          <div className="result-compare">
            <div className="result-side">
              <span className="result-label">正确答案：</span>
              <span className="result-value correct">{displayCorrectAnswer}</span>
            </div>
            <div className="result-side">
              <span className="result-label">我的答案：</span>
              <span className={`result-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                {displayMyAnswer}
              </span>
            </div>
          </div>
        )}
        {isComprehensive && (
          <div className={`comprehensive-answer ${!showAnswer ? 'hidden' : ''}`}>
            <span className="result-label">参考答案：</span>
            <span className="result-value">{question.analysis}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`question-item ${expanded ? 'expanded' : ''}`} onClick={onClick}>
      <div className="question-content">
        {renderQuestionNumber()}
        {highlightKeyword ? (
          <HighlightText text={question.content} highlight={highlightKeyword} />
        ) : (
          question.content
        )}
      </div>
      {expanded && (
        <>
          {showOptions && !isComprehensive && renderOptions()}
          {!isPracticeMode && showAnswer && (
            <div className="answer-section">
              <div className="answer-label">正确答案</div>
              <div className="answer-content">{formatAnswer(question)}</div>
            </div>
          )}
          {renderResult()}
          <div className={`analysis-section ${!showAnswer || !showAnalysis ? 'hidden' : ''}`}>
            <div className="analysis-label">答案解析</div>
            <div className="analysis-content">
              {highlightKeyword ? (
                <HighlightText text={question.analysis || ''} highlight={highlightKeyword} />
              ) : (
                question.analysis
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
