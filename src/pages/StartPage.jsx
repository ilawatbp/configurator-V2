import { useNavigate } from "react-router";
import Header from "../components/Header";

import CursorFollower from "../components/CursorFollower";

export default function StartPage() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center w-full h-full">
      <Header></Header>
      <button
        className="border border-black py-4 px-8 rounded-full"
        onClick={() => navigate("/penselect")}
      >
        Get Started
      </button>
    </div>
  );
}
