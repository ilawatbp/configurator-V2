import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
function App() {

  return (
      <div className="min-h-dvh w-full flex relative">
        <Sidebar />
        <Main flex-1/>
      </div>
    )
}

export default App
