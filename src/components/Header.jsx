import { useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, LoaderCircle } from "lucide-react";

import logo from "../assets/logo icon.png";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    const { error } = await signOut();

    if (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      return;
    }

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="fixed top-0 right-0 z-50">
      <div
        className="
          group
          relative
          w-24
          h-24
          flex
          justify-center
          items-center
        "
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            flex
            items-center
            justify-center
            w-12
            h-12
            rounded-xl
            transition
            hover:bg-neutral-100
          "
        >
          <img
            src={logo}
            alt="ILAW Configurator"
            className="w-8 h-8 object-contain"
          />
        </button>

        {/* Logout popup */}
        <div
          className="
            absolute
            top-18
            right-4

            opacity-0
            invisible
            translate-y-[-4px]

            group-hover:opacity-100
            group-hover:visible
            group-hover:translate-y-0

            group-focus-within:opacity-100
            group-focus-within:visible
            group-focus-within:translate-y-0

            transition-all
            duration-200
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="
              flex
              items-center
              gap-2

              min-w-30
              px-4
              py-2.5

              rounded-xl
              border
              border-neutral-200

              bg-white
              text-sm
              text-neutral-700

              shadow-lg

              transition

              hover:bg-red-50
              hover:text-red-600
              hover:border-red-200

              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isLoggingOut ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}

            {isLoggingOut
              ? "Logging out..."
              : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}