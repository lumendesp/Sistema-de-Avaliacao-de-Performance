import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManagerLayout from "../layouts/ManagerLayout.tsx";
import Collaborators from "../pages/manager/Status.tsx";
import MyEvolution from "../pages/manager/MyEvolutionManager.tsx";
import MyEvolutionCollaborator from "../pages/collaborator/MyEvolutionCollaborator.tsx";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/gestor" element={<ManagerLayout />}>
        <Route index element={<Collaborators />} />
      </Route>
      <Route path="/gestor/minha-evolucao" element={<MyEvolution />} />
      <Route path="/colaborador/minha-evolucao" element={<MyEvolutionCollaborator />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
