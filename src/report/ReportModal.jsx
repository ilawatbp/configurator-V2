import { useEffect } from "react";
import { createPortal } from "react-dom";
import {  X,  Printer } from "lucide-react";

import { useReportData } from "./useReportData";
import HolePlacementDrawing from "./HolePlacementDrawing";


function formatGeneratedDate(value) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleString();
}


export default function ReportModal({
  isOpen,
  onClose,
}) {
  const reportData =
    useReportData();

  const firstPendant =
    reportData.pendants[0];

  // Lock the configurator page while
  // the report popup is open.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm"
      id="configuration-report-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Generated configuration report"
    >
      <div className="flex h-dvh flex-col bg-gray-100">
        {/* Modal header */}
        <header className="report-modal-header flex shrink-0 items-center justify-between border-b border-gray-300 bg-white px-4 py-3 shadow-sm md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Configuration Report
            </h1>

            <p className="text-xs text-gray-500">
              Review the current configuration before printing.
            </p>
          </div>

          

<div className="flex items-center gap-2">
  <button
    type="button"
    onClick={() =>
      window.print()
    }
    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
  >
    <Printer className="h-4 w-4" />
    Print / Save PDF
  </button>

  <button
    type="button"
    onClick={onClose}
    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
  >
    <X className="h-4 w-4" />
    Close
  </button>
</div>

        </header>

        {/* Scrollable report */}
        <main className="report-modal-content flex-1 overflow-y-auto p-4 md:p-8">
          <div className="report-container mx-auto max-w-6xl space-y-6">
            {/* Report summary */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pendant Configuration Report
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Generated:{" "}
                  {formatGeneratedDate(
                    reportData.report.generatedAt
                  )}
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Model
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {firstPendant?.product
                      ?.modelName ??
                      firstPendant?.product
                        ?.modelId ??
                      "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Color
                  </p>

                  <p className="mt-1 font-medium capitalize text-gray-900">
                    {firstPendant?.product
                      ?.color ||
                      "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Baseplate Shape
                  </p>

                  <p className="mt-1 font-medium capitalize text-gray-900">
                    {reportData.baseplate
                      .shape ||
                      "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Number of Pendants
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {
                      reportData.pendants
                        .length
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* Hole-placement report */}
            <HolePlacementDrawing
              reportData={reportData}
              unit="cm"
            />
          </div>
        </main>
      </div>
    </div>,

    document.body
  );
}