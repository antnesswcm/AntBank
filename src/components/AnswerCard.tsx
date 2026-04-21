import './AnswerCard.css';

export interface AnswerCardProps {
  total: number;
  currentIndex: number;
  answerResults: Map<number, 'correct' | 'wrong'>;
  onSelect: (index: number) => void;
}

export function AnswerCard({ total, currentIndex, answerResults, onSelect }: AnswerCardProps) {
  const answeredCount = answerResults.size;

  return (
    <div className="answer-card">
      <div className="answer-card-header">
        <span className="answer-card-title">答题卡</span>
        <span className="answer-card-progress">
          {answeredCount}/{total}
        </span>
      </div>
      <div className="answer-card-grid">
        {Array.from({ length: total }, (_, i) => {
          const result = answerResults.get(i);
          let className = 'answer-card-item';

          if (i === currentIndex) {
            className += ' current';
          }

          if (result === 'correct') {
            className += ' correct';
          } else if (result === 'wrong') {
            className += ' wrong';
          }

          return (
            <button key={i} className={className} onClick={() => onSelect(i)}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
