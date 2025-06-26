import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { EvaluationProvider } from "./context/EvaluationsContext";

function App() {
  return (
    <AuthProvider>
      <EvaluationProvider>
        <AppRoutes />
      </EvaluationProvider>
    </AuthProvider>
  );
}

export default App;
