import {
  PanelRightOpen,
  X,
  FileText,
} from "lucide-react";

import { useState } from "react";

import ReportModal from "../report/ReportModal";
import CompositionPanel from "./CompositionPanel";


export default function Sidebar() {
  const [isOpen, setIsOpen] =
    useState(false);

  const [
    isReportOpen,
    setIsReportOpen,
  ] = useState(false);


  function toggleSidebar() {
    setIsOpen(
      (previous) => !previous
    );
  }


  return (
    <>
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-dvh
          shrink-0
          flex-col
          overflow-hidden
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
            flex
            h-12
            w-full
            shrink-0
            items-center

            ${
              isOpen
                ? "justify-end"
                : "justify-center"
            }
          `}
        >
          {!isOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <PanelRightOpen className="h-5 w-5" />
            </button>
          )}

          {isOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="m-4"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* SIDEBAR CONTENT */}
        <div
          className={`
            min-h-0
            flex-1
            overflow-y-auto
            px-5
            pb-8
            transition-opacity
            duration-200

            ${
              isOpen
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }
          `}
        >
          <h2 className="mb-6 text-2xl font-semibold">
            Composition
          </h2>

          <CompositionPanel />
        </div>

        {/* GENERATE REPORT */}
        <button
          type="button"
          onClick={() =>
            setIsReportOpen(true)
          }
          title={
            isOpen
              ? undefined
              : "Generate Report"
          }
          className={`
            mx-2
            mb-4
            flex
            h-11
            shrink-0
            items-center
            rounded-lg
            bg-gray-900
            text-white
            transition
            hover:bg-gray-700

            ${
              isOpen
                ? "justify-start gap-3 px-4"
                : "justify-center px-0"
            }
          `}
        >
          <FileText className="h-5 w-5 shrink-0" />

          {isOpen && (
            <span className="whitespace-nowrap text-sm font-medium">
              Generate Report
            </span>
          )}
        </button>
      </aside>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() =>
          setIsReportOpen(false)
        }
      />
    </>
  );
}