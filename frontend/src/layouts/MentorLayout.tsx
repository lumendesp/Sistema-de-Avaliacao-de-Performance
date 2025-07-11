import { Outlet } from "react-router-dom";
import SidebarMentor from "../components/Sidebar/SidebarMentor";

const ManagerLayout = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      <SidebarMentor />
      <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
