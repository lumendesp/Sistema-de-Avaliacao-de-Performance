import { Outlet } from "react-router-dom";
import SidebarCollaborator from "../components/Sidebar/SidebarCollaborator";

const CollaboratorLayout = () => {
  return (
    <div className="h-full bg-gray-50 flex">
      <SidebarCollaborator />
      <main className="flex-1 md:ml-64 transition-all duration-300 h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CollaboratorLayout;
