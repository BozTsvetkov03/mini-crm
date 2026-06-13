import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default PublicLayout;