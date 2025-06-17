import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManagerLayout from "../layouts/ManagerLayout.tsx";
import Collaborators from "../pages/manager/Status.tsx";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/gestor" element={<ManagerLayout />}>
        <Route index element={<Collaborators />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
