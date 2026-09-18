import { useRef } from "react";

import Sidebar from "../components/Sidebar";
import ConfiguratorScene from "../components/ConfiguratorScene";

import Header from "../components/Header";

export default function Configuration3D() {
  const sceneRef = useRef(null);

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Header />
      <Sidebar sceneRef={sceneRef} />

      <ConfiguratorScene ref={sceneRef} />
    </div>
  );
}
