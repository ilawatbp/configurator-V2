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
    signUp,
    signOut,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // If already logged in,
  // don't show login page again.
  useEffect(() => {
    // Only auto-redirect an already authenticated user
    // while the page is in normal login mode.
    //
    // During registration, Supabase can briefly create a
    // session when Confirm Email is disabled, so we do not
    // redirect while mode === "register".
    if (!authLoading && user && mode === "login") {
      navigate("/", {
        replace: true,
      });
    }
  }, [user, authLoading, navigate, mode]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  }

 async function handleSubmit(e) {
  e.preventDefault();

  if (isSubmitting) {
    return;
  }

  setErrorMessage("");
  setSuccessMessage("");
  setIsSubmitting(true);

  try {
    // =====================================================
    // REGISTER
    // =====================================================
    if (mode === "register") {
      if (password.length < 8) {
        setErrorMessage(
          "Password must be at least 8 characters."
        );
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage(
          "Passwords do not match."
        );
        return;
      }

      const { data, error } = await signUp(
        email.trim(),
        password
      );

      if (error) {
        setErrorMessage(
          error.message ||
            "Unable to create account."
        );
        return;
      }

      /*
       * Supabase may automatically create a
       * session after registration when
       * Confirm Email is disabled.
       *
       * Registration does NOT mean the user
       * is approved to use the Configurator.
       *
       * Sign them back out and wait for IT
       * to approve profiles.approved.
       */
      if (data?.session) {
        await signOut();
      }

      setSuccessMessage(
        "Registration submitted. Your account is waiting for IT approval. You can sign in after IT approves your access."
      );

      setPassword("");
      setConfirmPassword("");

      return;
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================
    if (mode === "forgot") {
      const { error } =
        await resetPassword(
          email.trim()
        );

      if (error) {
        setErrorMessage(
          error.message ||
            "Unable to send password reset email."
        );

        return;
      }

      setSuccessMessage(
        "If an account exists for this email, a password reset link has been sent."
      );

      return;
    }

    // =====================================================
    // LOGIN
    // =====================================================

    const { error } = await signIn(
      email.trim(),
      password
    );

    if (error) {
      // ---------------------------------------------------
      // Correct password, but IT has not approved account
      // ---------------------------------------------------
      if (
        error.code ===
        "ACCOUNT_PENDING_APPROVAL"
      ) {
        setErrorMessage(
          "Your account is waiting for IT approval."
        );

        return;
      }

      // ---------------------------------------------------
      // Supabase account exists, but profile is missing
      // ---------------------------------------------------
      if (
        error.code ===
        "PROFILE_NOT_FOUND"
      ) {
        setErrorMessage(
          "Your Configurator profile was not found. Please contact IT."
        );

        return;
      }

      // ---------------------------------------------------
      // Unable to check approval status
      // ---------------------------------------------------
      if (
        error.code ===
        "PROFILE_ERROR"
      ) {
        setErrorMessage(
          "Unable to verify your access. Please try again."
        );

        return;
      }

      // ---------------------------------------------------
      // Wrong email/password or normal Supabase auth error
      // ---------------------------------------------------
      setErrorMessage(
        "Invalid email or password."
      );

      return;
    }

    // =====================================================
    // APPROVED USER
    // =====================================================

    navigate("/", {
      replace: true,
    });
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    setErrorMessage(
      "Something went wrong. Please try again."
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

  const heading =
    mode === "register"
      ? "Create account"
      : mode === "forgot"
      ? "Reset password"
      : "Welcome back";

  const subheading =
    mode === "register"
      ? "Create your Configurator account"
      : mode === "forgot"
      ? "Enter your email and we'll send you a reset link"
      : "Sign in to continue";

  const submitLabel =
    mode === "register"
      ? "Create account"
      : mode === "forgot"
      ? "Send reset link"
      : "Sign in";

  const submittingLabel =
    mode === "register"
      ? "Creating account..."
      : mode === "forgot"
      ? "Sending..."
      : "Signing in...";

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
                {heading}
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {subheading}
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
              {mode !== "forgot" && (
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
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
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
              )}

              {/* Confirm Password */}
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    Confirm password
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
                      id="confirmPassword"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Confirm your password"
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
              )}

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

              {/* Success */}
              {successMessage && (
                <div
                  className="
                    rounded-xl
                    border
                    border-green-200
                    bg-green-50
                    px-4
                    py-3
                    text-sm
                    text-green-700
                  "
                >
                  {successMessage}
                </div>
              )}

              {/* Submit */}
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
                    {submittingLabel}
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </form>

            {/* Bottom note */}
            <div className="mt-8 border-t border-neutral-200 pt-6">

              {mode === "login" && (
                <div className="space-y-3 text-center">

                  <button
                    type="button"
                    onClick={() =>
                      changeMode("forgot")
                    }
                    className="
                      text-sm
                      text-neutral-500
                      transition
                      hover:text-neutral-950
                    "
                  >
                    Forgot your password?
                  </button>

                  <p className="text-sm text-neutral-500">
                    Don't have an account?{" "}

                    <button
                      type="button"
                      onClick={() =>
                        changeMode("register")
                      }
                      className="
                        font-medium
                        text-neutral-950
                        hover:underline
                      "
                    >
                      Register
                    </button>
                  </p>
                </div>
              )}

              {mode === "register" && (
                <p className="text-center text-sm text-neutral-500">
                  Already have an account?{" "}

                  <button
                    type="button"
                    onClick={() =>
                      changeMode("login")
                    }
                    className="
                      font-medium
                      text-neutral-950
                      hover:underline
                    "
                  >
                    Sign in
                  </button>
                </p>
              )}

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() =>
                    changeMode("login")
                  }
                  className="
                    block
                    w-full
                    text-center
                    text-sm
                    font-medium
                    text-neutral-700
                    transition
                    hover:text-neutral-950
                  "
                >
                  Back to sign in
                </button>
              )}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
