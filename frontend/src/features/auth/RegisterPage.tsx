import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { User, Mail, AtSign, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { AuthLayout } from "./components/AuthLayout";
import { AuthCheckbox } from "./components/AuthCheckbox";
import { AuthField } from "./components/AuthField";
import { GoogleButton } from "./components/GoogleButton";
import { AuthDivider } from "./components/AuthDivider";

type Errors = Partial<
  Record<"fullName" | "email" | "username" | "password" | "confirm" | "terms" | "form", string>
>;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!values.fullName.trim()) next.fullName = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address";
    if (values.username.trim().length < 3) next.username = "Username must be at least 3 characters";
    if (values.password.length < 8) next.password = "Password must be at least 8 characters";
    if (values.confirm !== values.password) next.confirm = "Passwords do not match";
    if (!agreed) next.terms = "Please accept the Terms of Service";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate({ to: "/dashboard" });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setErrors(err.fields as Errors);
      } else if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Coralz Cloud and start storing your files securely in the cloud."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Full Name"
          icon={User}
          placeholder="Enter your full name"
          autoComplete="name"
          value={values.fullName}
          onChange={set("fullName")}
          error={errors.fullName}
        />
        <AuthField
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <AuthField
          label="Username"
          icon={AtSign}
          placeholder="Choose a username"
          autoComplete="username"
          value={values.username}
          onChange={set("username")}
          error={errors.username}
        />
        <AuthField
          label="Password"
          icon={Lock}
          revealable
          placeholder="Create a password"
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
        />
        <AuthField
          label="Confirm Password"
          icon={Lock}
          revealable
          placeholder="Confirm your password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] text-foreground">
            <AuthCheckbox checked={agreed} onCheckedChange={setAgreed} className="mt-0.5" />

            <span>
              I agree to the <span className="font-medium text-primary">Terms of Service</span> and{" "}
              <span className="font-medium text-primary">Privacy Policy</span>
            </span>
          </label>
          {errors.terms && <p className="mt-2 text-xs font-medium text-destructive">{errors.terms}</p>}
        </div>

        {errors.form && (
          <p className="text-center text-sm font-medium text-destructive">{errors.form}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-[3.35rem] w-full rounded-xl text-[1.05rem] font-semibold shadow-none"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        <AuthDivider />

        <GoogleButton label="Sign up with Google" />

        <p className="text-center text-[0.98rem] text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
