import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManagerLayout from "../layouts/ManagerLayout.tsx";
import Collaborators from "../pages/manager/Status.tsx";
import DashboardManagerPage from "../pages/DashboardManagerPage";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/gestor" element={<ManagerLayout />}>
        <Route index element={<Collaborators />} />
      </Route>
      <Route path="/dashboard-gestor" element={<DashboardManagerPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
