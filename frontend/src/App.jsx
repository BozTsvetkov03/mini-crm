import { Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import FocusPage from "./pages/FocusPage";
import ProfilePage from "./pages/ProfilePage";
import CompletedTasksPage from "./pages/CompletedTasksPage";
import DueTasksPage from "./pages/DueTasksPage";
import PublicLayout from "./components/PublicLayout";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkspaceLayout from "./components/workspace/WorkspaceLayout";
import LoadingSpinner from "./components/LoadingSpinner";
import NotFound from "./pages/NotFound";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/*" element={<NotFound/>}></Route>
      </Route>

      {/* Authenticated pages live inside the workspace shell (sidebar) */}
      <Route
        element={
          <ProtectedRoute>
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/tasks/completed" element={<CompletedTasksPage />} />
        <Route path="/tasks/due" element={<DueTasksPage />} />
      </Route>
    </Routes>
  );
}

export default App;