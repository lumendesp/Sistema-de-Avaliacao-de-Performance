import { Link, Outlet, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/collaborator', label: 'Dashboard' },
  { path: '/collaborator/evaluation', label: 'Avaliações' },
];

const CollaboratorLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-100 p-5">
        <h2 className="text-lg font-bold mb-6">Colaborador</h2>
        <nav>
          <ul className="space-y-4">
            {menuItems.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`block text-sm ${
                    isActive(path)
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-800'
                  } hover:underline`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 bg-white overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CollaboratorLayout;
