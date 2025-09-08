import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { GOOGLE_LOGIN_ENDPOINT, LOGIN_ENDPOINT } from "../../utils/endPoints";
import { useAuth } from "../../context/authContext";
import Toast from "../../components/Toast/Toast";
import { useToast } from "../../context/toastContext";

interface User {
  name: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(LOGIN_ENDPOINT, { email, password });
      const { token, user } = res.data;
      login(token, user);
      navigate("/feed");
    } catch (err) {
      showToast("Invalid email or password", "error");
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      showToast("Google login failed. No credential received.", "error");
      return;
    }

    try {
      const response = await axios.post<LoginResponse>(GOOGLE_LOGIN_ENDPOINT, {
        idToken,
      });
      const { token, user } = response.data;

      login(token, user);

      showToast("Google login successful!", "success");
      navigate("/feed");
    } catch (error) {
      console.error("Login failed", error);
      showToast("Google login failed. Please try again.", "error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleFormLogin}
        className="p-6 bg-white shadow rounded-lg w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Login
        </button>
      </form>

      <div className="mt-4">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => showToast("Google login failed", "error")}
        />
      </div>

      <p className="mt-4">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-600 underline">
          Sign Up
        </a>
      </p>
    </div>
  );
};

export default Login;
