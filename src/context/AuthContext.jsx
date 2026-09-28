import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // CLEAR APP AUTH STATE
  // =====================================================

  function clearAuthState() {
    setUser(null);
    setSession(null);
    setProfile(null);
  }

  // =====================================================
  // GET USER PROFILE
  // =====================================================

  async function getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          id,
          email,
          approved,
          role,
          created_at
        `
      )
      .eq("id", userId)
      .maybeSingle();

    return {
      profile: data,
      error,
    };
  }

  // =====================================================
  // CHECK IF USER IS APPROVED
  // =====================================================

  async function validateSession(nextSession) {
    if (!nextSession?.user) {
      clearAuthState();

      return {
        allowed: false,
        reason: "SIGNED_OUT",
      };
    }

    const { profile: userProfile, error } =
      await getProfile(nextSession.user.id);

    // -----------------------------------------
    // Error loading profile
    // -----------------------------------------

    if (error) {
      console.error(
        "Error loading user profile:",
        error
      );

      clearAuthState();

      return {
        allowed: false,
        reason: "PROFILE_ERROR",
        error,
      };
    }

    // -----------------------------------------
    // Profile does not exist
    // -----------------------------------------

    if (!userProfile) {
      await supabase.auth.signOut({
        scope: "local",
      });

      clearAuthState();

      return {
        allowed: false,
        reason: "PROFILE_NOT_FOUND",
      };
    }

    // -----------------------------------------
    // User is NOT approved by IT
    // -----------------------------------------

    if (userProfile.approved !== true) {
      await supabase.auth.signOut({
        scope: "local",
      });

      clearAuthState();

      return {
        allowed: false,
        reason: "PENDING_APPROVAL",
      };
    }

    // -----------------------------------------
    // User is approved
    // -----------------------------------------

    setSession(nextSession);
    setUser(nextSession.user);
    setProfile(userProfile);

    return {
      allowed: true,
      profile: userProfile,
    };
  }

  // =====================================================
  // LOAD CURRENT SESSION
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      setLoading(true);

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Error loading auth session:",
          error
        );

        clearAuthState();
        setLoading(false);
        return;
      }

      if (!currentSession) {
        clearAuthState();
        setLoading(false);
        return;
      }

      await validateSession(currentSession);

      if (mounted) {
        setLoading(false);
      }
    }

    loadSession();

    // =====================================================
    // LISTEN FOR AUTH CHANGES
    // =====================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        /*
         * Defer the database check instead of performing
         * another Supabase request directly inside the
         * auth callback.
         */
        setTimeout(async () => {
          if (!mounted) {
            return;
          }

          if (!nextSession) {
            clearAuthState();
            setLoading(false);
            return;
          }

          setLoading(true);

          await validateSession(nextSession);

          if (mounted) {
            setLoading(false);
          }
        }, 0);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  async function signIn(email, password) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // Wrong email/password, etc.
    if (error) {
      return {
        data: null,
        error,
      };
    }

    // Password is correct.
    // Now check Configurator approval.
    const validation =
      await validateSession(data.session);

    // -----------------------------------------
    // Waiting for IT approval
    // -----------------------------------------

    if (
      validation.reason ===
      "PENDING_APPROVAL"
    ) {
      return {
        data: null,
        error: {
          code: "ACCOUNT_PENDING_APPROVAL",
          message:
            "Your account is waiting for IT approval.",
        },
      };
    }

    // -----------------------------------------
    // Profile missing
    // -----------------------------------------

    if (
      validation.reason ===
      "PROFILE_NOT_FOUND"
    ) {
      return {
        data: null,
        error: {
          code: "PROFILE_NOT_FOUND",
          message:
            "Your Configurator profile was not found. Please contact IT.",
        },
      };
    }

    // -----------------------------------------
    // Database/profile error
    // -----------------------------------------

    if (
      validation.reason ===
      "PROFILE_ERROR"
    ) {
      return {
        data: null,
        error: {
          code: "PROFILE_ERROR",
          message:
            "Unable to verify your account. Please try again.",
        },
      };
    }

    // -----------------------------------------
    // Approved
    // -----------------------------------------

    return {
      data,
      error: null,
    };
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function signOut() {
    const { error } =
      await supabase.auth.signOut({
        scope: "local",
      });

    clearAuthState();

    return {
      error,
    };
  }

  // =====================================================
  // APP URL
  // =====================================================

  function getAppUrl(path = "") {
    const base =
      import.meta.env.BASE_URL || "/";

    const cleanPath =
      path.replace(/^\/+/, "");

    return new URL(
      `${base}${cleanPath}`,
      window.location.origin
    ).toString();
  }

  // =====================================================
  // REGISTER
  // =====================================================

  async function signUp(email, password) {
    return await supabase.auth.signUp({
      email,
      password,

      options: {
        emailRedirectTo:
          getAppUrl(""),
      },
    });
  }

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  async function resetPassword(email) {
    return await supabase.auth
      .resetPasswordForEmail(
        email,
        {
          redirectTo:
            getAppUrl(
              "update-password"
            ),
        }
      );
  }

  // =====================================================
  // UPDATE PASSWORD
  // =====================================================

  async function updatePassword(
    newPassword
  ) {
    return await supabase.auth
      .updateUser({
        password: newPassword,
      });
  }

  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,

        signIn,
        signOut,
        signUp,

        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// USE AUTH
// =====================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}