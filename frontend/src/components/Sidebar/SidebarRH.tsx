import { useNavigate, NavLink } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { FlagIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import dashboardIcon from '../../assets/dashboard.svg';
import collaboratorsIcon from '../../assets/collaborators.svg';
import configIcon from '../../assets/config.svg';

const menuItems = [
  {
    path: '/rh',
    label: 'Dashboard',
    icon: <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />,
  },
  {
    path: '/rh/collaborators',
    label: 'Colaboradores',
    icon: <img src={collaboratorsIcon} alt="Colaboradores" className="w-5 h-5" />,
  },
  {
    path: '/rh/criteria',
    label: 'Critérios de Avaliação',
    icon: <img src={configIcon} alt="Critérios de Avaliação" className="w-5 h-5" />,
  },
  {
    path: '/rh/okr',
    label: 'Objetivos e Resultados-Chave',
    icon: <FlagIcon className="w-5 h-5" />,
  },
  {
    path: '/rh/pdi',
    label: 'Plano de Desenvolvimento Individual',
    icon: <UserGroupIcon className="w-5 h-5" />,
  },
];

const SidebarRH = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Botão menu mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow text-green-main"
      >
        <FiMenu size={20} />
      </button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 min-h-screen bg-white border-r z-50 flex flex-col justify-between py-6 px-4
          transition-transform duration-300 md:transform-none transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Fechar menu mobile */}
        <div className="md:hidden flex justify-end mb-2">
          <button onClick={() => setIsOpen(false)} className="text-green-main">
            <FiX size={24} />
          </button>
        </div>

        {/* Topo: logo + menu */}
        <div className="flex flex-col flex-1 justify-start">
          <div className="flex items-center mb-4 pl-2">
            <div className="w-5 h-5 bg-green-main rounded-sm mr-2" />
            <span className="font-bold text-lg text-green-main">RPE</span>
          </div>
          <nav>
            <ul className="flex flex-col gap-3">
              {menuItems.map(({ path, label, icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/rh'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                        isActive
                          ? 'bg-green-100 text-green-main font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    {icon}
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Rodapé */}
        <div className="flex flex-col gap-6">
          <button
            onClick={() => {
              navigate('/perfil');
              setIsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 group focus:outline-none"
            tabIndex={0}
          >
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:ring-2 group-hover:ring-green-main transition"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-bold group-hover:ring-2 group-hover:ring-green-main transition">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'RH'}
              </div>
            )}
            <p className="text-sm text-gray-700 font-medium group-hover:underline">
              {user?.name || 'Recursos Humanos'}
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
    </>
  );
};

export default SidebarRH;
