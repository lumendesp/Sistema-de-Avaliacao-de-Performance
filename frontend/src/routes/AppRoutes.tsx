import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import CollaboratorLayout from '../layouts/CollaboratorLayout';
import EvaluationLayout from '../layouts/EvaluationLayout';
import ManagerLayout from '../layouts/ManagerLayout';
import CommitteeLayout from '../layouts/CommitteeLayout';
import RHLayout from '../layouts/RHLayout';

import Dashboard from '../pages/collaborator/Dashboard';
import SelfEvaluation from '../pages/collaborator/evaluation/SelfEvaluation';
import PeerEvaluation from '../pages/collaborator/evaluation/PeerEvaluation';
import MentorEvaluation from '../pages/collaborator/evaluation/MentorEvaluation';
import ReferenceEvaluation from '../pages/collaborator/evaluation/ReferenceEvaluation';


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
      <Route path="/manager" element={<ManagerLayout />}>   
      </Route>
      <Route path="/committee" element={<CommitteeLayout />}>
      </Route>
      <Route path="/rh" element={<RHLayout />}>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
