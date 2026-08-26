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
  percent: 65,
  usedLabel: "32.5 GB",
  totalLabel: "50 GB",
  freeLabel: "17.5 GB free",
};

export const folders: FolderEntry[] = [
  { id: "1", name: "Documents", count: 32 },
  { id: "2", name: "Projects", count: 18 },
  { id: "3", name: "Photos", count: 124 },
  { id: "4", name: "Videos", count: 64 },
];

export const files: FileEntry[] = [
  { id: "1", name: "Project Proposal.pdf", kind: "pdf", starred: true, date: "May 24, 2024", size: "2.4 MB" },
  { id: "2", name: "Budget.xlsx", kind: "sheet", starred: false, date: "May 23, 2024", size: "1.1 MB" },
  { id: "3", name: "Meeting Notes.docx", kind: "doc", starred: false, date: "May 22, 2024", size: "534 KB" },
  { id: "4", name: "Design Mockup.png", kind: "image", starred: true, date: "May 21, 2024", size: "2.7 MB" },
  { id: "5", name: "Product Demo.mp4", kind: "video", starred: false, date: "May 20, 2024", size: "45.6 MB" },
  { id: "6", name: "Archive.zip", kind: "archive", starred: false, date: "May 19, 2024", size: "12.8 MB" },
];
