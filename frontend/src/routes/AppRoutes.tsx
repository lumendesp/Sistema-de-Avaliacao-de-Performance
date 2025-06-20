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
      />
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
