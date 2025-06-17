import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom";

import Committee from "./pages/Committee";

export function AppRoutes(){
    return(
        <Router>
            <Routes>
                <Route path="/" element={<div>Hello World</div>} />
                <Route path="/committee" element={<Committee />} />
            </Routes>
        </Router>
    )
}