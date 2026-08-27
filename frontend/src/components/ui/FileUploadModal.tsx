import { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Modal } from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (files: File[]) => Promise<void>;
};

export function FileUploadModal({ open, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setSelected((prev) => [...prev, ...arr]);
  }, []);

  const removeFile = (idx: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await onSubmit(selected);
      setSelected([]);
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload Files">
      <div className="space-y-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-hairline bg-secondary/30 hover:bg-secondary/50"
          }`}
        >
          <UploadCloud className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-[0.82rem] text-muted-foreground">
            Drag files here or <span className="font-medium text-primary">browse</span>
          </p>
          <p className="text-[0.72rem] text-muted-foreground/70">Max 2 GB per file</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {selected.length > 0 && (
          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {selected.map((f, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                <span className="truncate text-[0.8rem] font-medium text-foreground">
                  {f.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[0.72rem] text-muted-foreground">
                    {formatSize(f.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
            disabled={loading || selected.length === 0}
            className="rounded-xl bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Uploading..." : `Upload ${selected.length > 0 ? `(${selected.length})` : ""}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
