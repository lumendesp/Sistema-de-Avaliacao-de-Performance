import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

import CollaboratorLayout from "../layouts/CollaboratorLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import CommitteeLayout from "../layouts/CommitteeLayout";
import RHLayout from "../layouts/RHLayout";
import EvaluationLayout from "../layouts/EvaluationLayout";
import ComparisonLayout from "../layouts/ComparisonLayout"; // novo

import Dashboard from "../pages/collaborator/Dashboard";
import SelfEvaluation from "../pages/collaborator/evaluation/SelfEvaluation";
import PeerEvaluation from "../pages/collaborator/evaluation/PeerEvaluation";
import MentorEvaluation from "../pages/collaborator/evaluation/MentorEvaluation";
import ReferenceEvaluation from "../pages/collaborator/evaluation/ReferenceEvaluation";
import ComparisonEvaluation from "../pages/collaborator/evaluation/ComparisonEvaluation"; // novo

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

import Committee from "../pages/committee/Committee";
import Equalization from "../pages/committee/Equalization";

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
        <Route path ="/collaborator/progress" element={<EvolutionCollaborator />} />
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
          <Route path="peer-evaluation" element={<PeerEvaluation />} />
          <Route path="mentor-evaluation" element={<MentorEvaluation />} />
          <Route path="reference-evaluation" element={<ReferenceEvaluation />} />
        </Route>
        <Route
          path="evaluation-comparison"
          element={
            <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
              <ComparisonLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ComparisonEvaluation />} />
          <Route path="peer-evaluation" element={<PeerEvaluation />} />
          <Route path="mentor-evaluation" element={<MentorEvaluation />} />
          <Route path="reference-evaluation" element={<ReferenceEvaluation />} />
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
      </Route>

      <Route
        path="/mentor"
        element={
          <ProtectedRoute allowedRoles={["MENTOR", "ADMIN"]}>
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
              <ProtectedRoute allowedRoles={["MENTOR", "ADMIN"]}>
                <PeerEvaluationManager />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="historico" element={<EvolutionManager />} />
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
      </Route>

      <Route
        path="/rh"
        element={
          <ProtectedRoute allowedRoles={["HR", "ADMIN"]}>
            <RHLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/perfil" element={<Profile />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
