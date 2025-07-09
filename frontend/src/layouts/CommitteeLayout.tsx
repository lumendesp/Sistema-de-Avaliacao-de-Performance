import { Outlet } from 'react-router-dom';
import SidebarCommittee from '../components/Sidebar/SidebarCommittee';

const CommitteeLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarCommittee />
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default CommitteeLayout;
