interface HighlightTextProps {
  text: string;
  highlight?: string;
  highlightClassName?: string;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightText({
  text,
  highlight,
  highlightClassName = 'highlight',
}: HighlightTextProps) {
  if (!highlight || !text) {
    return <>{text}</>;
  }

  const escapedHighlight = escapeRegExp(highlight);
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

  return (
    <>
      {parts.map((part, index) => {
        if (part.toLowerCase() === highlight.toLowerCase()) {
          return (
            <span key={index} className={highlightClassName}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
