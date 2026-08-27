import { useCallback, useEffect, useState } from "react";
import { storageApi, type FileEntry, type FolderEntry, type StorageUsage } from "@/lib/api/storage";

export type BreadcrumbItem = {
  id: number | null;
  name: string;
};

export function useDashboard() {
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "My Drive" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id ?? null;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [f, fi, u] = await Promise.all([
        storageApi.listFolders(currentFolderId),
        storageApi.listFiles(currentFolderId),
        storageApi.getUsage(),
      ]);
      setFolders(f);
      setFiles(fi);
      setUsage(u);
    } catch (err: any) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const navigateToFolder = useCallback((folder: FolderEntry) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  }, []);

  const createFolder = useCallback(
    async (name: string) => {
      await storageApi.createFolder(name, currentFolderId);
      await refresh();
    },
    [currentFolderId, refresh],
  );

  const deleteFolder = useCallback(
    async (id: number) => {
      await storageApi.deleteFolder(id);
      await refresh();
    },
    [refresh],
  );

  const uploadFiles = useCallback(
    async (fileList: File[]) => {
      await storageApi.uploadFiles(fileList, currentFolderId);
      await refresh();
    },
    [currentFolderId, refresh],
  );

  const deleteFile = useCallback(
    async (id: number) => {
      await storageApi.deleteFile(id);
      await refresh();
    },
    [refresh],
  );

  return {
    folders,
    files,
    usage,
    breadcrumbs,
    loading,
    error,
    navigateToFolder,
    navigateToBreadcrumb,
    createFolder,
    deleteFolder,
    uploadFiles,
    deleteFile,
    refresh,
  };
}
