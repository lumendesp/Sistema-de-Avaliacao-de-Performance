import { Outlet } from "react-router-dom";

export default function ManagerLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
