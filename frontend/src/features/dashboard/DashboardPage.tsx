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

        <main className="mx-auto max-w-5xl space-y-5 px-4 pb-28 pt-3 sm:px-6 md:space-y-6 lg:px-8">
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
          className="fixed bottom-20 right-4 z-40 flex size-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 sm:right-6 sm:bottom-24 md:bottom-28 md:right-8 md:size-14"
        >
          <UploadCloud className="size-6 md:size-7" strokeWidth={2.25} />
        </button>

        <BottomNav />
      </div>
    </RequireAuth>
  );
}
