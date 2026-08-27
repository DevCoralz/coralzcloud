import { Modal } from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-5 text-[0.88rem] text-muted-foreground">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="rounded-xl px-4 py-2 text-[0.85rem] font-medium text-foreground transition-colors hover:bg-secondary active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="rounded-xl bg-red-500 px-4 py-2 text-[0.85rem] font-medium text-white transition-colors hover:bg-red-600 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Deleting..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
