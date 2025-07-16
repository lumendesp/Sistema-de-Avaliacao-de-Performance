import { Outlet } from 'react-router-dom';
import SidebarRH from '../components/Sidebar/SidebarRH';

const RHLayout = () => {
  return (
    <div className="min-h-screen bg-[#f1f1f1] flex">
      <SidebarRH />
      <main className="flex-1 md:ml-64 p-8 transition-all duration-300 h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default RHLayout;
