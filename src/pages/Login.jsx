import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
    signIn,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  // If already logged in,
  // don't show login page again.
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", {
        replace: true,
      });
    }
  }, [
    user,
    authLoading,
    navigate,
  ]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const { error } = await signIn(
        email.trim(),
        password
      );

      if (error) {
        setErrorMessage(
          "Invalid email or password."
        );

        return;
      }

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setErrorMessage(
        "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-neutral-950">
        <LoaderCircle className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-neutral-950 text-white">
      <div className="min-h-dvh grid lg:grid-cols-[1.15fr_0.85fr]">

        {/* LEFT SIDE */}
        <section className="relative hidden lg:flex overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />

          {/* Decorative glow */}
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

          <div className="absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-amber-400/10 blur-[140px]" />

          {/* Grid background */}
          <div
            className="
              absolute inset-0
              opacity-[0.04]
              bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
              bg-[size:48px_48px]
            "
          />

          {/* Content */}
          <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold tracking-wide">
                  ILAW
                </p>

                <p className="text-xs text-neutral-500">
                  Configurator
                </p>
              </div>
            </div>

            {/* Hero text */}
            <div className="max-w-xl">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Lighting Configuration Platform
              </p>

              <h1 className="text-5xl font-medium leading-[1.08] tracking-tight xl:text-6xl">
                Design your
                <span className="block text-neutral-400">
                  lighting composition.
                </span>
              </h1>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>
                ilaw atbp. Corporation
              </span>

              <span>
                Configurator V2 by NKS
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="relative flex min-h-dvh items-center justify-center bg-neutral-50 px-5 py-10 text-neutral-950 sm:px-8">

          {/* Mobile background */}
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-neutral-100 to-transparent lg:hidden" />

          <div className="relative w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold">
                  ILAW
                </p>

                <p className="text-xs text-neutral-500">
                  Configurator
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Sign in to continue
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-neutral-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-[18px]
                      w-[18px]
                      -translate-y-1/2
                      text-neutral-400
                    "
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    autoComplete="email"
                    placeholder="name@ilawatbp.com"
                    required
                    disabled={isSubmitting}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-neutral-200
                      bg-white
                      pl-11
                      pr-4
                      text-sm
                      outline-none
                      transition
                      placeholder:text-neutral-400
                      focus:border-neutral-400
                      focus:ring-4
                      focus:ring-neutral-950/5
                      disabled:cursor-not-allowed
                      disabled:bg-neutral-100
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-neutral-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-[18px]
                      w-[18px]
                      -translate-y-1/2
                      text-neutral-400
                    "
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                    disabled={isSubmitting}
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-neutral-200
                      bg-white
                      pl-11
                      pr-12
                      text-sm
                      outline-none
                      transition
                      placeholder:text-neutral-400
                      focus:border-neutral-400
                      focus:ring-4
                      focus:ring-neutral-950/5
                      disabled:cursor-not-allowed
                      disabled:bg-neutral-100
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-neutral-400
                      transition
                      hover:text-neutral-700
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div
                  className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  {errorMessage}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-neutral-950
                  px-4
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-neutral-800
                  focus:outline-none
                  focus:ring-4
                  focus:ring-neutral-950/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Bottom note */}
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <p className="text-center text-xs leading-5 text-neutral-400">
                register
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}