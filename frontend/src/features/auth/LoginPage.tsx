import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserRound, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthLayout } from "./components/AuthLayout";
import { AuthCheckbox } from "./components/AuthCheckbox";
import { AuthField } from "./components/AuthField";
import { GoogleButton } from "./components/GoogleButton";
import { AuthDivider } from "./components/AuthDivider";

type Errors = Partial<Record<"identifier" | "password", string>>;

export function LoginPage() {
  const [values, setValues] = useState({ identifier: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!values.identifier.trim()) next.identifier = "Enter your email or username";
    if (!values.password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // Frontend-only placeholder — no sign-in happens yet.
      setSubmitted(true);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your email or username to access your Coralz Cloud files."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email or Username"
          icon={UserRound}
          placeholder="Enter your email or username"
          autoComplete="username"
          value={values.identifier}
          onChange={set("identifier")}
          error={errors.identifier}
        />
        <AuthField
          label="Password"
          icon={Lock}
          revealable
          placeholder="Enter your password"
          autoComplete="current-password"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-3 text-[0.95rem] text-foreground">
            <AuthCheckbox checked={remember} onCheckedChange={setRemember} />
            Remember me
          </label>

          <span className="text-[0.95rem] font-medium text-primary">Forgot password?</span>
        </div>

        <Button
          type="submit"
          className="h-[3.35rem] w-full rounded-xl text-[1.05rem] font-semibold shadow-none"
        >
          Sign In
        </Button>

        {submitted && (
          <p className="text-center text-sm font-medium text-primary">
            Looks good — sign-in is coming in the next phase.
          </p>
        )}

        <AuthDivider />

        <GoogleButton label="Sign in with Google" />

        <p className="text-center text-[0.98rem] text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
