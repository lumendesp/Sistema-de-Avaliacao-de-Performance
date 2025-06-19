import { Outlet } from 'react-router-dom';
import SidebarCommittee from '../components/Sidebar/SidebarCommittee';

const CommitteeLayout = () => {
  return (
    <div className="min-h-screen">
      <SidebarCommittee />
      <main className="ml-64 p-8 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CommitteeLayout;
