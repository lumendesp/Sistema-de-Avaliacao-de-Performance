import { Outlet } from "react-router-dom";
import SidebarManager from "../components/Sidebar/SidebarManager";

const ManagerLayout = () => {
  return (
    <div className="min-h-screen flex">
      <SidebarManager />
      <main className="flex-1 min-h-screen bg-[#F5F6FA] ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
