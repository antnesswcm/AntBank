import { Button } from './Button';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = '确认',
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        {title && <div className="confirm-title">{title}</div>}
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}
