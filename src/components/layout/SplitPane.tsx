import { ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import './SplitPane.css';

export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  defaultLeftWidth?: number;
  defaultRatio?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  onChange?: (leftWidth: number) => void;
}

export function SplitPane({
  left,
  right,
  defaultLeftWidth,
  defaultRatio,
  minLeftWidth = 100,
  minRightWidth = 100,
  onChange,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number>(() => defaultLeftWidth ?? 300);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (defaultRatio && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setLeftWidth(containerWidth * defaultRatio);
    }
  }, [defaultRatio]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = e.clientX - containerRect.left;
      const maxLeftWidth = containerRect.width - minRightWidth;

      const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
      setLeftWidth(clampedWidth);
      onChange?.(clampedWidth);
    },
    [isDragging, minLeftWidth, minRightWidth, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  return (
    <div ref={containerRef} className={`split-pane ${isDragging ? 'dragging' : ''}`}>
      <div className="split-pane-left" style={{ width: leftWidth }}>
        {left}
      </div>
      <div className="split-pane-handle-area">
        <div
          className={`split-pane-handle ${isDragging ? 'active' : ''}`}
          onMouseDown={handleMouseDown}
        />
      </div>
      <div className="split-pane-right">{right}</div>
    </div>
  );
}
