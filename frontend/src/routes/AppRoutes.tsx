import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

import CollaboratorLayout from "../layouts/CollaboratorLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import CommitteeLayout from "../layouts/CommitteeLayout";
import RHLayout from "../layouts/RHLayout";
import EvaluationLayout from "../layouts/EvaluationLayout";
import ComparisonLayout from "../layouts/ComparisonLayout"; // novo
import MentorLayout from "../layouts/MentorLayout";

import Dashboard from "../pages/collaborator/Dashboard";
import SelfEvaluation from "../pages/collaborator/evaluation/SelfEvaluation";
import PeerEvaluationPage from "../pages/collaborator/evaluation/PeerEvaluation";
import MentorEvaluation from "../pages/collaborator/evaluation/MentorEvaluation";
import ReferenceEvaluation from "../pages/collaborator/evaluation/ReferenceEvaluation";
import ComparisonEvaluation from "../pages/collaborator/evaluation/ComparisonEvaluation"; // novo
import PeerEvaluationComparison from "../pages/collaborator/evaluation/PeerEvaluationComparison";
import MentorEvaluationComparison from "../pages/collaborator/evaluation/MentorEvaluationComparison";
import ReferenceEvaluationComparison from "../pages/collaborator/evaluation/ReferenceEvaluationComparison";
import OKRCollaborator from "../pages/collaborator/OKR";
import PDICollaborator from "../pages/collaborator/PDI";

import Login from "../pages/login/Login";
import Unauthorized from "../pages/login/Unauthorized";
import Profile from "../pages/profile/Profile";
import Collaborators from "../pages/manager/Status.tsx";
import EvolutionCollaborator from "../pages/collaborator/EvolutionCollaborator.tsx";
import ManagerEvaluationLayout from "../layouts/ManagerEvaluationLayout.tsx";
import DashboardManagerPage from "../pages/DashboardManagerPage";
import CollaboratorEvaluation from "../pages/manager/Evaluation.tsx";
import EvolutionManager from "../pages/manager/EvolutionManager.tsx";
import PeerEvaluationManager from "../pages/manager/Evaluation360.tsx";

/* Adicione aqui embaixo os imports do mentor*/
import MentorEvaluationLayout from "../layouts/MentorEvaluationLayout.tsx";
import DashboardMentorPage from "../pages/mentor/DashboardMentorPage";
import MentorStatus from "../pages/mentor/Status";
import EvolutionMentor from "../pages/mentor/EvolutionMentor";
import PeerEvaluationMentor from "../pages/mentor/Evaluation360";
import BrutalFactsMentor from "../pages/mentor/BrutalFacts";
import MentorEvaluationPage from "../pages/mentor/Evaluation";
import MentorSelfEvaluationReadOnly from "../pages/mentor/CollaboratorEval";
import OKRManager from "../pages/manager/OKR";
import PDIManager from "../pages/manager/PDI";

import Committee from "../pages/committee/Committee";
import Equalization from "../pages/committee/Equalization";
import OKRCommittee from "../pages/committee/OKR";
import PDICommittee from "../pages/committee/PDI";

import RHDashboard from "../pages/RH/RHDashboard/RHDashboard";
import RHCollaboratorsPage from "../pages/RH/RHCollaborators/RHCollaborators";
import RHCriteriaSettingsPage from "../pages/RH/RHCriteriaSettings/RHCriteriaSettings";
import OKRRH from "../pages/RH/OKR";
import PDIRH from "../pages/RH/PDI";

import BrutalFacts from "../pages/manager/BrutalFacts";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/collaborator"
        element={
          <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
            <CollaboratorLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collaborator/progress"
          element={<EvolutionCollaborator />}
        />
        <Route
          path="evaluation"
          element={
            <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
              <EvaluationLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="self-evaluation" />} />
          <Route path="self-evaluation" element={<SelfEvaluation />} />
          <Route path="peer-evaluation" element={<PeerEvaluationPage />} />
          <Route path="mentor-evaluation" element={<MentorEvaluation />} />
          <Route
            path="reference-evaluation"
            element={<ReferenceEvaluation />}
          />
        </Route>
        <Route path="okr" element={<OKRCollaborator />} />
        <Route path="pdi" element={<PDICollaborator />} />
        <Route
          path="evaluation-comparison"
          element={
            <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
              <ComparisonLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ComparisonEvaluation />} />
          <Route
            path="peer-evaluation"
            element={<PeerEvaluationComparison />}
          />
          <Route
            path="mentor-evaluation"
            element={<MentorEvaluationComparison />}
          />
          <Route
            path="reference-evaluation"
            element={<ReferenceEvaluationComparison />}
          />
        </Route>
      </Route>

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardManagerPage />} />
        <Route path="collaborators" element={<Collaborators />} />
        <Route path="avaliacao/:id" element={<ManagerEvaluationLayout />}>
          <Route index element={<CollaboratorEvaluation />} />
          <Route path="historico" element={<EvolutionCollaborator />} />
          <Route
            path="360"
            element={
              <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                <PeerEvaluationManager />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="historico" element={<EvolutionManager />} />
        <Route path="brutal-facts" element={<BrutalFacts />} />
        <Route path="okr" element={<OKRManager />} />
        <Route path="pdi" element={<PDIManager />} />
      </Route>

      <Route
        path="/mentor"
        element={
          <ProtectedRoute allowedRoles={["MENTOR", "ADMIN"]}>
            <MentorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardMentorPage />} />
        <Route path="collaborators" element={<MentorStatus />} />
        <Route path="avaliacao/:id" element={<MentorEvaluationLayout />}>
          <Route index element={<MentorEvaluationPage />} />
          <Route path="" element={<div>Selecione uma aba</div>} />
          <Route path="360" element={<PeerEvaluationMentor />} />
          <Route
            path="autoavaliacao"
            element={<MentorSelfEvaluationReadOnly />}
          />
          <Route path="historico" element={<EvolutionMentor />} />
        </Route>
        <Route path="historico" element={<EvolutionMentor />} />
        <Route path="brutal-facts" element={<BrutalFactsMentor />} />
        <Route path="okr" element={<OKRManager />} />
        <Route path="pdi" element={<PDIManager />} />
      </Route>

      <Route
        path="/committee"
        element={
          <ProtectedRoute allowedRoles={["COMMITTEE", "ADMIN"]}>
            <CommitteeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Committee />} />
        <Route path="equalizations" element={<Equalization />} />
        <Route path="okr" element={<OKRCommittee />} />
        <Route path="pdi" element={<PDICommittee />} />
      </Route>

      <Route
        path="/rh"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
            <RHLayout />
          </ProtectedRoute>
        }
      >
        {/* Rota Padrão para /rh -> Renderiza o Dashboard */}
        <Route index element={<RHDashboard />} />

        {/* Rota para /rh/collaborators -> Renderiza a Página de Colaboradores */}
        <Route path="collaborators" element={<RHCollaboratorsPage />} />

        {/* No futuro, a rota para /rh/criteria viria aqui */}
        <Route path="criteria" element={<RHCriteriaSettingsPage />} />
        <Route path="okr" element={<OKRRH />} />
        <Route path="pdi" element={<PDIRH />} />
      </Route>
      <Route path="/perfil" element={<Profile />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
