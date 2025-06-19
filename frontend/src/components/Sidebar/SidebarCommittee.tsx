import { NavLink } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { LuLayoutDashboard } from 'react-icons/lu';
import { LuListChecks } from 'react-icons/lu';

const menuItems = [
  {
    path: '/committee',
    label: 'Dashboard',
    icon: <LuLayoutDashboard size={18} />,
  },
  {
    path: '/committee/equalizations',
    label: 'Equalizações',
    icon: <LuListChecks size={18} />,
    badge: true,
  },
];

const SidebarCommittee = () => {
  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r z-50 flex flex-col justify-between py-6 px-4">
      {/* Topo */}
      <div>
        <div className="flex items-center mb-10 pl-2">
          <div className="w-5 h-5 bg-green-main rounded-sm mr-2" />
          <span className="font-bold text-lg text-green-main">RPE</span>
        </div>

        <nav>
          <ul className="flex flex-col gap-3">
            {menuItems.map(({ path, label, icon, badge }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/committee'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                      isActive
                        ? 'bg-green-100 text-green-main font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {icon}
                  <span className="flex items-center gap-1">
                    {label}
                    {badge && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Rodapé */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-bold">
            CM
          </div>
          <p className="text-sm text-gray-700 font-medium">Comitê</p>
        </div>

        <NavLink
          to="/logout"
          className="flex items-center gap-2 text-sm text-green-main font-medium hover:underline pl-2"
        >
          <FiLogOut size={16} />
          Logout
        </NavLink>
      </div>
    </aside>
  );
};

export default SidebarCommittee;
