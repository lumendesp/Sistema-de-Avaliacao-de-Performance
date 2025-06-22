import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";

import CollaboratorLayout from "../layouts/CollaboratorLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import CommitteeLayout from "../layouts/CommitteeLayout";
import RHLayout from "../layouts/RHLayout";

import Dashboard from "../pages/collaborator/Dashboard";
import EvaluationLayout from "../layouts/EvaluationLayout";
import SelfEvaluation from "../pages/collaborator/evaluation/SelfEvaluation";
import PeerEvaluation from "../pages/collaborator/evaluation/PeerEvaluation";
import MentorEvaluation from "../pages/collaborator/evaluation/MentorEvaluation";
import ReferenceEvaluation from "../pages/collaborator/evaluation/ReferenceEvaluation";

import Login from "../pages/login/Login";
import Unauthorized from "../pages/login/Unauthorized";
import Profile from "../pages/profile/Profile";

import Collaborators from "../pages/manager/Status.tsx";
import EvolutionCollaborator from "../pages/collaborator/EvolutionCollaborator.tsx";
import ManagerEvaluationLayout from "../layouts/ManagerEvaluationLayout.tsx";
import DashboardManagerPage from "../pages/DashboardManagerPage";
import CollaboratorEvaluation from "../pages/manager/Evaluation.tsx";
import EvolutionManager from "../pages/manager/EvolutionManager.tsx";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
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
          path="evaluation"
          element={
            <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
              <EvaluationLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="self-evaluation" />} />
          <Route
            path="self-evaluation"
            element={
              <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
                <SelfEvaluation />
              </ProtectedRoute>
            }
          />
          <Route
            path="peer-evaluation"
            element={
              <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
                <PeerEvaluation />
              </ProtectedRoute>
            }
          />
          <Route
            path="mentor-evaluation"
            element={
              <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
                <MentorEvaluation />
              </ProtectedRoute>
            }
          />
          <Route
            path="reference-evaluation"
            element={
              <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
                <ReferenceEvaluation />
              </ProtectedRoute>
            }
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
      />
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
