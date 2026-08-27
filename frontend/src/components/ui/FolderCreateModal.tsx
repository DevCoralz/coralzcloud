import { useState } from "react";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export function FolderCreateModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Folder name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(trimmed);
      setName("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Folder">
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
          placeholder="Folder name"
          autoFocus
          className="w-full rounded-xl border border-hairline bg-secondary/50 px-4 py-2.5 text-[0.9rem] text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
        />
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
