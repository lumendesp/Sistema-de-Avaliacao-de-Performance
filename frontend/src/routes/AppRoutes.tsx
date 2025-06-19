import { BrowserRouter, Routes, Route } from "react-router-dom";

import CollaboratorLayout from "../layouts/CollaboratorLayout";

import { ProtectedRoute } from "../components/ProtectedRoute";

import Dashboard from "../pages/collaborator/Dashboard";
import PeerEvaluation from "../pages/collaborator/PeerEvaluation";
import MentorEvaluation from "../pages/mentor/MentorEvaluation";
import ReferenceEvaluation from "../pages/reference/ReferenceEvaluation";
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
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
