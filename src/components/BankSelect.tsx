import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './BankSelect.css';

export interface BankOption {
  slug: string;
  title: string;
}

export interface BankSelectProps {
  banks: BankOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  allOptionLabel?: string;
}

export function BankSelect({
  banks,
  value,
  onChange,
  allOptionLabel = '全部题库',
}: BankSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedBank = value ? banks.find(b => b.slug === value) : null;
  const displayText = selectedBank ? selectedBank.title : allOptionLabel;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug: string | null) => {
    onChange(slug);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`bank-select ${isOpen ? 'open' : ''}`}>
      <div className="bank-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="bank-select-text">{displayText}</span>
        <ChevronDown size={16} className="bank-select-icon" />
      </div>
      {isOpen && (
        <div className="bank-select-dropdown">
          <div
            className={`bank-select-option ${value === null ? 'selected' : ''}`}
            onClick={() => handleSelect(null)}
          >
            {allOptionLabel}
          </div>
          <div className="bank-select-divider" />
          {banks.map(bank => (
            <div
              key={bank.slug}
              className={`bank-select-option ${value === bank.slug ? 'selected' : ''}`}
              onClick={() => handleSelect(bank.slug)}
            >
              {bank.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
