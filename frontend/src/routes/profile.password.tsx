import { createFileRoute } from "@tanstack/react-router";
import { PasswordPage } from "@/features/profile/PasswordPage";

export const Route = createFileRoute("/profile/password")({
  component: PasswordPage,
});
