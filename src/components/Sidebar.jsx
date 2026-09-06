import { PanelRightOpen, X } from "lucide-react";
import { useState } from "react";

import CompositionPanel from "./CompositionPanel";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        h-dvh
        flex
        flex-col
        shrink-0
        overflow-hidden
        border-r
        border-gray-300
        transition-all
        duration-300

        ${
          isOpen
            ? "w-80 bg-white"
            : "w-18 bg-transparent"
        }
      `}
    >
      {/* HEADER */}
      <div
        className={`
          h-12
          shrink-0
          flex
          items-center
          w-full
          ${
            isOpen
              ? "justify-end"
              : "justify-center"
          }
        `}
      >
        {!isOpen && (
          <button onClick={toggleSidebar}>
            <PanelRightOpen className="h-5 w-5" />
          </button>
        )}

        {isOpen && (
          <button
            onClick={toggleSidebar}
            className="m-4"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* SIDEBAR CONTENT */}
      <div
        className={`
          flex-1
          min-h-0
          overflow-y-auto
          px-5
          pb-8
          transition-opacity
          duration-200

          ${
            isOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }
        `}
      >
        <h2 className="text-2xl font-semibold mb-6">
          Composition
        </h2>

        <CompositionPanel />
      </div>
    </aside>
  );
}