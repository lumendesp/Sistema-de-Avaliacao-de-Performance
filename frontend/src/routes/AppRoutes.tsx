import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CollaboratorLayout from '../layouts/CollaboratorLayout';
import CommitteeLayout from '../layouts/CommitteeLayout';
import Dashboard from '../pages/collaborator/Dashboard';
import PeerEvaluation from '../pages/collaborator/PeerEvaluation';
import MentorEvaluation from '../pages/mentor/MentorEvaluation';
import ReferenceEvaluation from '../pages/reference/ReferenceEvaluation';
import Committee from "../pages/committee/Committee";
import Equalization from "../pages/committee/Equalization"

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/collaborator" element={<CollaboratorLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="peer-evaluation" element={<PeerEvaluation />} />
        <Route path="mentor-evaluation" element={<MentorEvaluation />} />
        <Route path="reference-evaluation" element={<ReferenceEvaluation />} />
      </Route>

      <Route path="/committee" element={<CommitteeLayout />}>
        <Route index element={<Committee />} />
        <Route path="equalization" element={<Equalization />} />
      </Route>

    </Routes>
  </BrowserRouter>
);

export default AppRoutes;