import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ColaboratorLayout from './layouts/ColaboratorLayout';
import Dashboard from './pages/colaborator/Dashboard';
import Evaluation from './pages/colaborator/Evaluation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/colaborador" element={<ColaboratorLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="avaliacao" element={<Evaluation />} />
        </Route>

        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;