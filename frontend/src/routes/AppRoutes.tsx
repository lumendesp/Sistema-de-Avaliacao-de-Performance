import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/perfil" element={<Profile />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
