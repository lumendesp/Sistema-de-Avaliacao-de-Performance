import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Committee from "./pages/Committee";
import Equalization from "./pages/committee/Equalization";
import PdfPreview from "./pages/pdf-preview";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/committee",
        element: <Committee />
    },
    {
        path: "/committee/equalization",
        element: <Equalization />
    },
    {
        path: "/pdf-preview",
        element: <PdfPreview />
    }
]);

export default router; 