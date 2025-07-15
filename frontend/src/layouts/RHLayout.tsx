import { Outlet } from 'react-router-dom';
import SidebarRH from '../components/Sidebar/SidebarRH';

const RHLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarRH />
      <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default RHLayout;
