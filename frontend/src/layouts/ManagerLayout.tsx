import { Outlet } from "react-router-dom";
import SidebarManager from "../components/Sidebar/SidebarManager";

const ManagerLayout = () => {
  return (
    <div className="min-h-screen bg-[#F1F1F1] flex">
      <SidebarManager />
      <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
