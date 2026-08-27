import { useState } from "react";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export function FileCreateModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("File name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(trimmed);
      setName("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New File">
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="File name (e.g. notes)"
          autoFocus
          className="w-full rounded-xl border border-hairline bg-secondary/50 px-4 py-2.5 text-[0.9rem] text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
        <p className="text-[0.75rem] text-muted-foreground">A blank .txt file will be created</p>
        {error && <p className="text-[0.8rem] text-red-500">{error}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-[0.85rem] font-medium text-foreground transition-colors hover:bg-secondary active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
