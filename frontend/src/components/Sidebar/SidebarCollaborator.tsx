import { NavLink } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { LuLayoutDashboard } from 'react-icons/lu';
import { PiPencilSimpleLineBold } from 'react-icons/pi';

const menuItems = [
  {
    path: '/collaborator',
    label: 'Dashboard',
    icon: <LuLayoutDashboard size={18} />,
  },
  {
    path: '/collaborator/evaluation',
    label: 'Avaliação de ciclo',
    icon: <PiPencilSimpleLineBold size={18} />,
    badge: true,
  },
  {
    path: '/collaborator/progress',
    label: 'Evolução',
    icon: <LuLayoutDashboard size={18} />,
  },
];

const SidebarCollaborator = () => {
  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r z-50 flex flex-col justify-between py-6 px-4">
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
                  end={path === '/collaborator'}
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-bold">
            CN
          </div>
          <p className="text-sm text-gray-700 font-medium">Colaborador 1</p>
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

export default SidebarCollaborator;
