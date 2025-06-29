import { useNavigate, NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import dashboardIcon from "../../assets/dashboard.svg";
import colaboratorsIcon from "../../assets/collaborators.svg";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  {
    path: "/manager", // Dashboard principal
    label: "Dashboard",
    icon: <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />,
  },
  {
    path: "/manager/collaborators",
    label: "Colaboradores",
    icon: (
      <img src={colaboratorsIcon} alt="Colaboradores" className="w-5 h-5" />
    ),
  },
  {
    path: "/manager/brutal-facts",
    label: "Brutal Facts",
    icon: <DocumentTextIcon className="w-5 h-5" />,
  },
];

const SidebarManager = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            {menuItems.map(({ path, label, icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === "/manager"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                      isActive
                        ? "bg-green-100 text-green-main font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
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

      {/* avatar + nome agora levam a /perfil */}
      <div className="flex flex-col gap-6">
        <button
          onClick={() => navigate("/perfil")}
          className="flex items-center gap-2 pl-2 group focus:outline-none"
          tabIndex={0}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700 font-bold group-hover:ring-2 group-hover:ring-green-main transition">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "GS"}
          </div>
          <p className="text-sm text-gray-700 font-medium group-hover:underline">
            {user?.name || "Manager"}
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

export default SidebarManager;
