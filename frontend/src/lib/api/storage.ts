import { api } from "../api/client";

export type FolderEntry = {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
};

export type FileEntry = {
  id: number;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  folderId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type StorageUsage = {
  usedBytes: number;
  usedLabel: string;
  totalLabel: string;
  freeLabel: string;
  percent: number;
};

export const storageApi = {
  getUsage: () => api.get<StorageUsage>("/storage/usage"),

  listFolders: (parentId?: number | null) => {
    const q = parentId != null ? `?parentId=${parentId}` : "";
    return api.get<FolderEntry[]>(`/folders${q}`);
  },

  createFolder: (name: string, parentId?: number | null) =>
    api.post<FolderEntry>("/folders", { name, parentId: parentId ?? null }),

  deleteFolder: (id: number) => api.del<void>(`/folders/${id}`),

  listFiles: (folderId?: number | null) => {
    const q = folderId != null ? `?folderId=${folderId}` : "";
    return api.get<FileEntry[]>(`/files${q}`);
  },

  uploadFiles: (files: File[], folderId?: number | null) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    const q = folderId != null ? `?folderId=${folderId}` : "";
    return api.upload<FileEntry[]>(`/files/upload${q}`, fd);
  },

  getDownloadUrl: (id: number) => `/api/files/${id}/download`,

  deleteFile: (id: number) => api.del<void>(`/files/${id}`),
};
