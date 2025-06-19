import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "../components/ProtectedRoute";

import CollaboratorLayout from "../layouts/CollaboratorLayout";

import Dashboard from "../pages/collaborator/Dashboard";
import EvaluationLayout from "../layouts/EvaluationLayout";
import SelfEvaluation from "../pages/collaborator/evoluation/SelfEvaluation";
import PeerEvaluation from "../pages/collaborator/evoluation/PeerEvaluation";
import MentorEvaluation from "../pages/collaborator/evoluation/MentorEvaluation";
import ReferenceEvaluation from "../pages/collaborator/evoluation/ReferenceEvaluation";
import Login from "../pages/login/Login";
import Unauthorized from "../pages/login/Unauthorized";

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
          <Route
            index
            element={
              <ProtectedRoute allowedRoles={["COLLABORATOR", "ADMIN"]}>
                <Navigate to="self-evaluation" />
              </ProtectedRoute>
            }
          />
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
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
