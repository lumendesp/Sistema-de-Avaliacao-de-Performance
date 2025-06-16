import { BrowserRouter, Routes, Route } from "react-router-dom";

import PeerEvaluation from "../pages/PeerEvaluation";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/peer-evaluation" element={<PeerEvaluation />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
