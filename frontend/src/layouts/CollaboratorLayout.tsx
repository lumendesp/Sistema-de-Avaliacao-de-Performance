import { Outlet } from 'react-router-dom';
import SidebarCollaborator from '../components/Sidebar/SidebarCollaborator';

const CollaboratorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarCollaborator />
      <main className="ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default CollaboratorLayout;
