import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardManagerPage from "../pages/DashboardManagerPage";

const AppRoutes = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard-gestor" element={<DashboardManagerPage />} />
      </Routes>
    </BrowserRouter>
  );
};





export default AppRoutes;