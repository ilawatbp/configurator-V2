import { useNavigate } from "react-router";


export default function StartPage() {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center w-full h-full">
      <button
        className="border border-black py-4 px-8 rounded-full"
        onClick={() => navigate("/penselect")}
      >
        Get Started
      </button>
    </div>
  );
}
