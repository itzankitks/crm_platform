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
import { AuthProvider, useAuth } from "./context/authContext";
import { ToastProvider } from "./context/toastContext";
import Campaigns from "./pages/Campaigns/Campaigns";
import Segments from "./pages/Segments/Segments";
import Customers from "./pages/Customers/Customers";
import NotFound from "./pages/NotFound/NotFound";
import Loading from "./components/Loading/Loading";
import HomePage from "./pages/HomePage/HomePage";
import CampaignDetail from "./pages/CampaignDetail/CampaignDetail";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated === undefined) {
    return <Loading />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated === undefined) {
    return <Loading />;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
  if (isAuthenticated === undefined) {
    return <Loading />;
  }
  const showNavbar =
    isAuthenticated && !["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar userName={user?.name || ""} />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
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
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaign/:id"
          element={
            <ProtectedRoute>
              <CampaignDetail />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
