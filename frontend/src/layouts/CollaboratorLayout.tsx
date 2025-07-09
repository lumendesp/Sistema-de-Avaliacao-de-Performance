import { Outlet } from 'react-router-dom';
import SidebarCollaborator from '../components/Sidebar/SidebarCollaborator';

const CollaboratorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarCollaborator />
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default CollaboratorLayout;
