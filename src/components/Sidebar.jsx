import { Menu, ArrowLeft } from "lucide-react";
import { useState } from "react";
export default function Sidebar() {
  const [isCollapse, setIsCollapse] = useState(false);

  function collapseHandle() {
    setIsCollapse((prev) => !prev);
  }

  return (
    <aside
      className={`
        absolute
        bg-white
        shadow-gray-500
        shadow-md
        min-h-dvh
        flex
        shrink-0
        overflow-hidden
        ${isCollapse ? "w-64 justify-end" : "w-16 justify-center"}
      transition-all duration-300`}
    >
      <div>
        <Menu
          className={`m-4 h-5 w-5 ${isCollapse ? "hidden" : "flex"}`}
          onClick={collapseHandle}
        />

        <ArrowLeft
          className={`m-4 h-5 w-5 ${isCollapse ? "flex" : "hidden"}`}
          onClick={collapseHandle}
        />
        {console.log(isCollapse)}
      </div>
    </aside>
  );
}
