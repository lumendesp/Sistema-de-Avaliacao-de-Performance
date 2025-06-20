import { Outlet } from 'react-router-dom';
import SidebarManager from '../components/Sidebar/SidebarManager';

const ManagerLayout = () => {
  return (
    <div className="min-h-screen">
      <SidebarManager />
      <main className="ml-64 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
