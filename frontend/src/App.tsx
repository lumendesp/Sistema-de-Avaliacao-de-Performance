import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CollaboratorLayout from './layouts/CollaboratorLayout';
import Dashboard from './pages/collaborator/Dashboard';
import Evaluation from './pages/collaborator/Evaluation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/colaborador" element={<CollaboratorLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="avaliacao" element={<Evaluation />} />
        </Route>

        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;