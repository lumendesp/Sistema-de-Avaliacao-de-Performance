import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManagerLayout from "../layouts/ManagerLayout.tsx";
import Collaborators from "../pages/manager/Status.tsx";
import MyEvolution from "../pages/manager/MyEvolutionManager.tsx";
import MyEvolutionCollaborator from "../pages/collaborator/MyEvolutionCollaborator.tsx";
import ManagerEvaluationLayout from "../layouts/ManagerEvaluationLayout.tsx";
import DashboardManagerPage from "../pages/DashboardManagerPage";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/gestor" element={<ManagerLayout />}>
        <Route index element={<Collaborators />} />
        <Route path="avaliacao/:id" element={<ManagerEvaluationLayout />}>
          <Route index element={<CollaboratorEvaluation />} />
        </Route>
      </Route>
      <Route path="/gestor/minha-evolucao" element={<MyEvolution />} />
      <Route path="/colaborador/minha-evolucao" element={<MyEvolutionCollaborator />} />
      <Route path="/dashboard-gestor" element={<DashboardManagerPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
