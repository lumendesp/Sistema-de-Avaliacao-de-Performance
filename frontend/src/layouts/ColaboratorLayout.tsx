import { Link, Outlet, useLocation } from 'react-router-dom';

const ColaboratorLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 220, background: '#eee', padding: 20 }}>
        <h2>Colaborador</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <Link
                to="/colaborador"
                style={{
                  color: isActive('/colaborador') ? 'blue' : 'black',
                  fontWeight: isActive('/colaborador') ? 'bold' : 'normal',
                  textDecoration: 'none',
                }}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/colaborador/avaliacao"
                style={{
                  color: isActive('/colaborador/avaliacao') ? 'blue' : 'black',
                  fontWeight: isActive('/colaborador/avaliacao') ? 'bold' : 'normal',
                  textDecoration: 'none',
                }}
              >
                Avaliação
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ColaboratorLayout;
