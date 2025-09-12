import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { SIGNUP_ENDPOINT, GOOGLE_SIGNUP_ENDPOINT } from "../../utils/endPoints";
import { useAuth } from "../../context/authContext";

const Signup: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFormSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(SIGNUP_ENDPOINT, { name, email, password });
      const { token, user } = res.data;

      login(token, user);
      navigate("/");
    } catch (err: any) {
      console.error("Signup error:", err);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSignup = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return alert("Google signup failed");

    try {
      const res = await axios.post(GOOGLE_SIGNUP_ENDPOINT, { idToken });
      const { token, user } = res.data;

      login(token, user);

      navigate("/feed");
    } catch (err: any) {
      console.error("Google signup error:", err);
      alert(err.response?.data?.message || "Google signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleFormSignup}
        className="p-6 bg-white shadow rounded-lg w-80"
      >
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />
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
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Sign Up
        </button>
      </form>

      <div className="mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() => alert("Google signup failed")}
        />
      </div>

      <p className="mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 underline">
          Login
        </a>
      </p>
    </div>
  );
};

export default Signup;
