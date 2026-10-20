import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./views/pages/Welcome";
import Login from "./views/pages/Login";
import Portal from "./views/pages/Portal"; 
import DashboardDM from "./views/pages/DashboardDM";
import DashboardPlayer from "./views/pages/DashboardPlayer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/dashboard/dm" element={<DashboardDM />} />
        <Route path="/dashboard/player" element={<DashboardPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;