import { Routes, Route } from "react-router";

// pages
import StartPage from "./pages/StartPage";
import Configuration3D from "./pages/Configuration3D";
import MaterialSelection from "./pages/MaterialSelection";
import PendantSelection from "./pages/PendantSelection";

function App() {

  return (
      <div className="min-h-dvh w-full flex relative">        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/penselect" element={<PendantSelection />} />
            <Route path="/matselect" element={<MaterialSelection />} />
            <Route path="/config" element={<Configuration3D />} />
          </Routes>
        </main>
      </div>
    )
}

export default App
