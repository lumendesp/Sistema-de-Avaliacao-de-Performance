import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CollaboratorLayout from '../layouts/CollaboratorLayout';
import Dashboard from '../pages/collaborator/Dashboard';
import PeerEvaluation from '../pages/collaborator/PeerEvaluation';
import MentorEvaluation from '../pages/mentor/MentorEvaluation';
import ReferenceEvaluation from '../pages/reference/ReferenceEvaluation';
import SelfEvaluation from '../pages/collaborator/SelfEvaluation';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/collaborator" element={<CollaboratorLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="peer-evaluation" element={<PeerEvaluation />} />
        <Route path="mentor-evaluation" element={<MentorEvaluation />} />
        <Route path="reference-evaluation" element={<ReferenceEvaluation />} />
        <Route path="self-evaluation" element={<SelfEvaluation />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;