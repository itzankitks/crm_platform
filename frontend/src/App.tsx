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
import CampaignsPage from "./pages/Campaigns/CampaignsPage";
import Customers from "./pages/Customers/Customers";
import NotFound from "./pages/NotFound/NotFound";
import Loading from "./components/Loading/Loading";
import CampaignDetail from "./pages/CampaignDetail/CampaignDetail";
import SegmentsPage from "./pages/Segments/SegmentsPage";
import Orders from "./pages/Orders/Orders";
import Campaigns from "./pages/Campaigns/Campaigns";
import CampaignHistory from "./pages/Campaigns/CampaignHistory";
import Dashboard from "./pages/Dashboard/Dashboard";
import HomePage from "./pages/HomePage/HomePage";

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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaign/create"
          element={
            <ProtectedRoute>
              <CampaignsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaign/stats"
          element={
            <ProtectedRoute>
              <CampaignHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/segments"
          element={
            <ProtectedRoute>
              <SegmentsPage />
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
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
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
