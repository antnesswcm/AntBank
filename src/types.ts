export interface Option {
  id: number;
  content: string;
}

export interface Answer {
  option_ids: number[];
}

export interface Question {
  id: number;
  content: string;
  type: number;
  type_name: string;
  options: Option[];
  answer: Answer;
  analysis: string | null;
}

export interface Chapter {
  id: number;
  title: string;
  total: number;
  questions: Question[];
}

export interface Meta {
  title: string;
  slug: string;
  description: string;
  total: number;
  created_at: string;
}

export interface QuestionBank {
  meta: Meta;
  chapters: Chapter[];
}

export interface LoadedBank {
  id: string;
  bank: QuestionBank;
}

export interface BuiltInBank {
  filename: string;
  title: string;
  slug: string;
  total: number;
}

export interface ExternalBank {
  id: string;
  path: string;
  title: string;
  slug: string;
  total: number;
}

export interface BankListItem {
  id: string;
  title: string;
  slug: string;
  total: number;
  isBuiltin: boolean;
  filename?: string;
  path?: string;
}

export type ViewType = 'browse' | 'search' | 'practice' | 'settings' | 'bankManager';

export interface Settings {
  showAnalysis: boolean;
  autoShowAnswer: boolean;
  randomOrder: boolean;
  alwaysOnTop: boolean;
}

export function getCorrectOptionIds(question: Question): number[] {
  return question.answer?.option_ids || [];
}

export function getCorrectOptions(question: Question): Option[] {
  const optionIds = getCorrectOptionIds(question);
  if (!optionIds.length) return [];
  return question.options.filter(opt => optionIds.includes(opt.id));
}

export function isTrueFalseQuestion(question: Question): boolean {
  if (!question.options || question.options.length !== 2) {
    return false;
  }
  const optContents = question.options.map(o => o.content.toLowerCase());
  return (
    (optContents.some(c => c.includes('正确') || c.includes('对') || c.includes('true')) &&
      optContents.some(c => c.includes('错误') || c.includes('错') || c.includes('false'))) ||
    (optContents.some(c => c.includes('t')) && optContents.some(c => c.includes('f')))
  );
}

export function formatAnswer(question: Question): string {
  const optionIds = getCorrectOptionIds(question);
  if (!optionIds.length) return '';

  if (isTrueFalseQuestion(question)) {
    return optionIds.includes(1) ? '对' : '错';
  }

  return optionIds.map(id => String.fromCharCode(64 + id)).join(', ');
}

export function getOptionLetter(optionId: number): string {
  return String.fromCharCode(64 + optionId);
}
