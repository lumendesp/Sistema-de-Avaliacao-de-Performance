import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RHDashboard from './pages/RH/RHDashboard/RHDashboard';
import RHCollaboratorsPage from './pages/RH/RHCollaborators/RHCollaborators';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/rh" element={<RHDashboard />} />
        <Route path="/rhcollaborators" element={<RHCollaboratorsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;