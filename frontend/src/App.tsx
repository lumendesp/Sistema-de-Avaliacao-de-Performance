// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RHDashboard from './pages/RHDashboard/RHDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/rh" element={<RHDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;