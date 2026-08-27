import { createFileRoute } from "@tanstack/react-router";
import { EditProfilePage } from "@/features/profile/EditProfilePage";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfilePage,
});
