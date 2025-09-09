import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import Signup from "./pages/Signup/Signup";
import Feed from "./pages/Feed/Feed";
import { AuthProvider, useAuth } from "./context/authContext";
import { ToastProvider } from "./context/toastContext";
import Campaigns from "./pages/Campaigns/Campaigns";
import Segments from "./pages/Segments/Segments";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }
  return <>{children}</>;
};

function App() {
  // const userName = localStorage.getItem("userName");

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const showNavbar =
    isAuthenticated && !["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar userName={user?.name || ""} />}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/feed" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaign"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/segment"
          element={
            <ProtectedRoute>
              <Segments />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/feed" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
