import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth/LoginPage";

const title = "Sign in — Coralz Cloud";
const description =
  "Sign in to Coralz Cloud with your email or username to access your files anytime, anywhere.";

export const Route = createFileRoute("/login")({
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
  component: LoginPage,
});
