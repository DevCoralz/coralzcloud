import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/features/auth/RegisterPage";

const title = "Create your account — Coralz Cloud";
const description =
  "Join Coralz Cloud and start storing your files securely in the cloud. Create your free account in seconds.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://id-preview--61b1df89-3cad-407c-bb85-24d303eab053.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://id-preview--61b1df89-3cad-407c-bb85-24d303eab053.lovable.app/og-image.jpg" },
    ],
  }),
  component: RegisterPage,
});
