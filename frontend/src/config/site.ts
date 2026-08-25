export type NavItem = {
  label: string;
  to: string;
};

export const site = {
  name: "Coralz Cloud",
  description: "Coralz Cloud keeps your files secure in the cloud.",
  nav: [
    { label: "Home", to: "/" },
    { label: "Login", to: "/login" },
    { label: "Register", to: "/register" },
  ] satisfies NavItem[],
};
