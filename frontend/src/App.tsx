import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Import your components
import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import Signup from "./pages/Signup/Signup";

interface AppContentProps {
  userName: string | null;
}

function App() {
  const userName = localStorage.getItem("userName");

  return (
    console.log(
      "VITE_GOOGLE_CLIENT_ID:",
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    ),
    (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AppContent userName={userName} />
        </BrowserRouter>
      </GoogleOAuthProvider>
    )
  );
}

function AppContent({ userName }: AppContentProps) {
  const location = useLocation();

  return (
    <>
      {userName && location.pathname !== "/login" && (
        <Navbar userName={userName} />
      )}
      <Routes>
        <Route
          path="/"
          element={
            userName ? <Navigate to="/feed" /> : <Navigate to="/login" />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
