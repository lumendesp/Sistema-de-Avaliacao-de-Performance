import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManagerLayout from "../layouts/ManagerLayout.tsx";
import Collaborators from "../pages/manager/Status.tsx";
import EvolutionCollaborator from "../pages/collaborator/EvolutionCollaborator.tsx";
import ManagerEvaluationLayout from "../layouts/ManagerEvaluationLayout.tsx";
import DashboardManagerPage from "../pages/DashboardManagerPage";
import CollaboratorEvaluation from "../pages/manager/Evaluation.tsx";
import EvolutionManager from "../pages/manager/EvolutionManager.tsx";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/gestor" element={<ManagerLayout />}>
        <Route index element={<Collaborators />} />
        <Route path="avaliacao/:id" element={<ManagerEvaluationLayout />}>
          <Route index element={<CollaboratorEvaluation />} />
          <Route path="historico" element={<EvolutionCollaborator />} />
        </Route>
        <Route path="historico" element={<EvolutionManager />} />
      </Route>
      <Route path="/dashboard-gestor" element={<DashboardManagerPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
