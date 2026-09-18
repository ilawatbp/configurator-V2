import { Routes, Route } from "react-router";

// pages
import StartPage from "./pages/StartPage";
import Configuration3D from "./pages/Configuration3D";
import MaterialSelection from "./pages/MaterialSelection";
import PendantSelection from "./pages/PendantSelection";
import HolePlacementPage from "./pages/HolePlacementPage";
import Login from "./pages/Login";

// auth
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <div className="min-h-dvh w-full flex relative">
      <main className="flex-1">
        <Routes>

          {/* Public */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <StartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/penselect"
            element={
              <ProtectedRoute>
                <PendantSelection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matselect"
            element={
              <ProtectedRoute>
                <MaterialSelection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/config"
            element={
              <ProtectedRoute>
                <Configuration3D />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hole-placement"
            element={
              <ProtectedRoute>
                <HolePlacementPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>
    </div>
  );
}

export default App;