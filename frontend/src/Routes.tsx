import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom";

import Committee from "./pages/Committee";
import Equalization from "./pages/Equalization";

export function AppRoutes(){
    return(
        <Router>
            <Routes>
                <Route path="/" element={<div>Hello World</div>} />
                <Route path="/committee" element={<Committee />} />
                <Route path="/committee/equalization" element={<Equalization />} />
            </Routes>
        </Router>
    )
}