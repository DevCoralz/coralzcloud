/** Frontend-only mock data for the dashboard. No backend yet. */

export type FileKind = "pdf" | "sheet" | "doc" | "image" | "video" | "archive";

export const storage = {
  usedLabel: "32.5 GB",
  totalLabel: "50 GB",
  percent: 65,
  freeLabel: "17.5 GB free",
};

export const folders = [
  { id: "documents", name: "Documents", count: 32 },
  { id: "projects", name: "Projects", count: 18 },
  { id: "photos", name: "Photos", count: 124 },
  { id: "videos", name: "Videos", count: 64 },
];

export const files: {
  id: string;
  name: string;
  date: string;
  size: string;
  kind: FileKind;
  starred?: boolean;
}[] = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    date: "May 24, 2024",
    size: "2.4 MB",
    kind: "pdf",
    starred: true,
  },
  { id: "2", name: "Budget.xlsx", date: "May 23, 2024", size: "1.1 MB", kind: "sheet" },
  { id: "3", name: "Meeting Notes.docx", date: "May 22, 2024", size: "534 KB", kind: "doc" },
  {
    id: "4",
    name: "Design Mockup.png",
    date: "May 21, 2024",
    size: "2.7 MB",
    kind: "image",
    starred: true,
  },
  { id: "5", name: "Product Demo.mp4", date: "May 20, 2024", size: "45.6 MB", kind: "video" },
  { id: "6", name: "Archive.zip", date: "May 19, 2024", size: "12.8 MB", kind: "archive" },
];
