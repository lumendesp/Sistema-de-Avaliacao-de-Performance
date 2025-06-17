import { Link, Outlet, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/collaborator', label: 'Dashboard' },
  { path: '/collaborator/self-evaluation', label: 'Autoavaliação' },
  { path: '/collaborator/peer-evaluation', label: 'Avaliação por Pares' },
  { path: '/collaborator/mentor-evaluation', label: 'Avaliação por Mentores' },
  { path: '/collaborator/reference-evaluation', label: 'Avaliação por Referências' },
];

const CollaboratorLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 220, background: '#eee', padding: 20 }}>
        <h2>Colaborador</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {menuItems.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  style={{
                    color: isActive(path) ? 'blue' : 'black',
                    fontWeight: isActive(path) ? 'bold' : 'normal',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default CollaboratorLayout;