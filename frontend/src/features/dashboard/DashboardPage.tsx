import { UploadCloud } from "lucide-react";
import { DashboardHeader } from "./components/DashboardHeader";
import { SearchBar } from "./components/SearchBar";
import { StorageCard } from "./components/StorageCard";
import { QuickActions } from "./components/QuickActions";
import { FoldersRow } from "./components/FoldersRow";
import { FileList } from "./components/FileList";
import { BottomNav } from "./components/BottomNav";
import { RequireAuth } from "@/lib/auth/RequireAuth";

export function DashboardPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="mx-auto max-w-5xl space-y-6 px-5 pb-32 pt-2 sm:px-8">
          <h1 className="sr-only">My Drive</h1>
          <div className="animate-rise">
            <SearchBar />
          </div>
          <div className="animate-rise">
            <StorageCard />
          </div>
          <div className="animate-rise">
            <QuickActions />
          </div>
          <FoldersRow />
          <FileList />
        </main>

        <button
          type="button"
          aria-label="Upload files"
          className="shadow-royal fixed bottom-24 right-5 z-30 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 sm:right-8"
        >
          <UploadCloud className="size-7" strokeWidth={2.25} />
        </button>

        <BottomNav />
      </div>
    </RequireAuth>
  );
}
