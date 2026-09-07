import Sidebar from "../components/Sidebar";
import ConfiguratorScene from "../components/ConfiguratorScene";

export default function Configuration3D() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Sidebar />

      <ConfiguratorScene />
    </div>
  );
}