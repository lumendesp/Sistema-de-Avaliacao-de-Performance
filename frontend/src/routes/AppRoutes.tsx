import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CollaboratorLayout from '../layouts/CollaboratorLayout';
import Dashboard from '../pages/collaborator/Dashboard';
import Evaluation from '../pages/collaborator/Evaluation';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/colaborador" element={<CollaboratorLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="avaliacao" element={<Evaluation />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;