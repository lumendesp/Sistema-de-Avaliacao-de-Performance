import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";

const AppRoutes = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard-gestor" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};





export default AppRoutes;