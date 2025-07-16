import { Outlet } from 'react-router-dom';
import SidebarAdmin from '../components/Sidebar/SidebarAdmin'
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
