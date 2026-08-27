import { UploadCloud } from "lucide-react";
import { useState } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { SearchBar } from "./components/SearchBar";
import { StorageCard } from "./components/StorageCard";
import { QuickActions } from "./components/QuickActions";
import { FileBrowser } from "./components/FileBrowser";
import { BottomNav } from "./components/BottomNav";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import { useDashboard } from "./hooks/useDashboard";
import { FolderCreateModal } from "@/components/ui/FolderCreateModal";
import { FileUploadModal } from "@/components/ui/FileUploadModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function DashboardPage() {
  const {
    folders,
    files,
    usage,
    breadcrumbs,
    navigateToFolder,
    navigateToBreadcrumb,
    createFolder,
    deleteFolder,
    uploadFiles,
    deleteFile,
  } = useDashboard();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "folder" | "file";
    id: number;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "folder") {
        await deleteFolder(deleteTarget.id);
      } else {
        await deleteFile(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="mx-auto max-w-5xl space-y-5 px-4 pb-28 pt-3 sm:px-6 md:space-y-6 lg:px-8">
          <h1 className="sr-only">My Drive</h1>
          <div className="animate-rise">
            <SearchBar />
          </div>
          {usage && (
            <div className="animate-rise">
              <StorageCard usage={usage} />
            </div>
          )}
          <div className="animate-rise">
            <QuickActions
              onUpload={() => setShowUpload(true)}
              onCreateFolder={() => setShowCreateFolder(true)}
            />
          </div>
          <FileBrowser
            folders={folders}
            files={files}
            breadcrumbs={breadcrumbs}
            onNavigateToFolder={navigateToFolder}
            onNavigateToBreadcrumb={navigateToBreadcrumb}
            onCreateFolder={() => setShowCreateFolder(true)}
            onUploadFile={() => setShowUpload(true)}
            onDeleteFolder={(id) => {
              const f = folders.find((x) => x.id === id);
              setDeleteTarget({ type: "folder", id, name: f?.name || "this folder" });
            }}
            onDeleteFile={(id) => {
              const f = files.find((x) => x.id === id);
              setDeleteTarget({ type: "file", id, name: f?.originalName || "this file" });
            }}
          />
        </main>

        <button
          type="button"
          aria-label="Upload files"
          onClick={() => setShowUpload(true)}
          className="fixed bottom-20 right-4 z-40 flex size-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 sm:right-6 sm:bottom-24 md:bottom-28 md:right-8 md:size-14"
        >
          <UploadCloud className="size-6 md:size-7" strokeWidth={2.25} />
        </button>

        <BottomNav />

        <FolderCreateModal
          open={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onSubmit={createFolder}
        />

        <FileUploadModal
          open={showUpload}
          onClose={() => setShowUpload(false)}
          onSubmit={uploadFiles}
        />

        <ConfirmModal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={`Delete ${deleteTarget?.type === "folder" ? "Folder" : "File"}`}
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
        />
      </div>
    </RequireAuth>
  );
}
