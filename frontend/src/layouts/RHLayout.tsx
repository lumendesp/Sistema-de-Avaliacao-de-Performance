import { Outlet } from 'react-router-dom';
import SidebarRH from '../components/Sidebar/SidebarRH';

const RHLayout = () => {
  return (
    <div className="min-h-screen">
      <SidebarRH />
      <main className="ml-64 p-8 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default RHLayout;
