import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/home/HomePage";
import { site } from "@/config/site";

const title = "Coralz Cloud — Your files, secure in the cloud";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: site.description },
      { property: "og:title", content: title },
      { property: "og:description", content: site.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://id-preview--61b1df89-3cad-407c-bb85-24d303eab053.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://id-preview--61b1df89-3cad-407c-bb85-24d303eab053.lovable.app/og-image.jpg" },
    ],
  }),
  component: HomePage,
});
