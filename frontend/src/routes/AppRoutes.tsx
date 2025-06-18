import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CollaboratorLayout from '../layouts/CollaboratorLayout';
import Dashboard from '../pages/collaborator/Dashboard';
import EvaluationLayout from '../layouts/EvaluationLayout';
import SelfEvaluation from '../pages/collaborator/SelfEvaluation';
import PeerEvaluation from '../pages/collaborator/PeerEvaluation';
import MentorEvaluation from '../pages/mentor/MentorEvaluation';
import ReferenceEvaluation from '../pages/reference/ReferenceEvaluation';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/collaborator" element={<CollaboratorLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="evaluation" element={<EvaluationLayout />}>
          <Route index element={<Navigate to="self-evaluation" />} />
          <Route path="self-evaluation" element={<SelfEvaluation />} />
          <Route path="peer-evaluation" element={<PeerEvaluation />} />
          <Route path="mentor-evaluation" element={<MentorEvaluation />} />
          <Route path="reference-evaluation" element={<ReferenceEvaluation />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
