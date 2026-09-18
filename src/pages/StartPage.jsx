import { useNavigate } from "react-router";

import Header from "../components/Header";
import MouseGlow from "../components/MouseGlow";

export default function StartPage() {
  const navigate = useNavigate();

  return (
    <div
      className="
        relative
        flex
        justify-center
        items-center
        w-full
        min-h-dvh
        overflow-hidden
        bg-white
      "
    >
      <MouseGlow />

      <Header />

      <button
        className="
          relative
          z-10

          border
          border-black
          py-4
          px-8
          rounded-full

          transition-all
          duration-300

          hover:bg-black
          hover:text-white
          hover:scale-105

          active:scale-95
        "
        onClick={() =>
          navigate("/penselect")
        }
      >
        Get Started
      </button>
    </div>
  );
}