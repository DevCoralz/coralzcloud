export type FileKind = "pdf" | "sheet" | "doc" | "image" | "video" | "archive";

export type FileEntry = {
  id: string;
  name: string;
  kind: FileKind;
  starred: boolean;
  date: string;
  size: string;
};

export type FolderEntry = {
  id: string;
  name: string;
  count: number;
};

export type StorageSummary = {
  percent: number;
  usedLabel: string;
  totalLabel: string;
  freeLabel: string;
};

/**
 * Placeholder data for the dashboard UI. File/folder management and
 * real storage accounting are implemented in a later phase (see
 * docs/ARCHITECTURE.md — Phase 4). This keeps the existing dashboard
 * components rendering without changing their design.
 */

export const storage: StorageSummary = {
  percent: 0,
  usedLabel: "0 MB",
  totalLabel: "5 GB",
  freeLabel: "5 GB free",
};

export const folders: FolderEntry[] = [];

export const files: FileEntry[] = [];
