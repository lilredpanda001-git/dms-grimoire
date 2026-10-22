import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./views/pages/Welcome";
import Login from "./views/pages/Login";
import Portal from "./views/pages/Portal"; 
import DashboardDM from "./views/pages/DashboardDM";
import DashboardPlayer from "./views/pages/DashboardPlayer";
import VerifiedRoute from "./views/components/VerifiedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<VerifiedRoute><Portal /></VerifiedRoute>} />
        <Route path="/dashboard/dm" element={<VerifiedRoute><DashboardDM /></VerifiedRoute>} />
        <Route path="/dashboard/player" element={<VerifiedRoute><DashboardPlayer /></VerifiedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;