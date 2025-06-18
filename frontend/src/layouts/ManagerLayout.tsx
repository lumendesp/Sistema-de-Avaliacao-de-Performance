import { Outlet } from "react-router-dom";

export default function ManagerLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-[88px] bg-white flex items-center px-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Colaboradores</h1>
      </div>

      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
