import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AdminPage } from "@/features/admin/AdminPage";

export const Route = createFileRoute("/admin/$slug")({
  component: AdminGuard,
});

function AdminGuard() {
  const { slug } = Route.useParams();
  const storedSlug = sessionStorage.getItem("admin_slug");

  if (storedSlug && slug === storedSlug) {
    return <AdminPage />;
  }

  return <Navigate to="/dashboard" />;
}
