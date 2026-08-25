/**
 * Single source of truth for product-level copy and routing.
 * Future phases (auth, dashboard, pricing) register their routes here.
 */
export const site = {
  name: "Coralz Cloud",
  tagline: "Your files, secure in the cloud",
  description:
    "Coralz Cloud keeps your files secure in the cloud — store, access and share them anytime, anywhere.",
  url: "https://coralz.cloud",
  nav: [
    { label: "Features", to: "/" },
    { label: "Pricing", to: "/" },
    { label: "Support", to: "/" },
  ],
} as const;
