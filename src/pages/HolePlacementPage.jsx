import { useReportData } from "../report/useReportData";
import HolePlacementDrawing from "../report/HolePlacementDrawing";

export default function HolePlacementPage() {
  const reportData =
    useReportData();

  return (
    <main className="min-h-dvh bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <HolePlacementDrawing
          reportData={reportData}
          unit="cm"
        />
      </div>
    </main>
  );
}