import { NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import dashboardIcon from '../../assets/dashboard.svg';
import evaluationIcon from '../../assets/evaluation.svg';
import evolutionIcon from '../../assets/evolution.svg';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  {
    path: '/collaborator',
    label: 'Dashboard',
    icon: <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />,
  },
  {
    path: '/collaborator/evaluation',
    label: 'Avaliação de ciclo',
    icon: <img src={evaluationIcon} alt="Avaliação de ciclo" className="w-5 h-5" />,
    badge: true,
  },
  {
    path: '/collaborator/progress',
    label: 'Evolução',
    icon: <img src={evolutionIcon} alt="Evolução" className="w-5 h-5" />,
  },
];

const SidebarCollaborator = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 pl-2 group focus:outline-none"
          tabIndex={0}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-bold group-hover:ring-2 group-hover:ring-green-main transition">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CN'}
          </div>
          <p className="text-sm text-gray-700 font-medium group-hover:underline">
            {user?.name || 'Colaborador 1'}
          </p>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-green-main font-bold hover:underline pl-2"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SidebarCollaborator;
