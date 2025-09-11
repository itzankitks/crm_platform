import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, Sparkles, MessageCircle } from "lucide-react";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Smarter Campaigns, Powered by AI
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            Automate segmentation, generate personalized messages, and track
            your campaign performance with ease.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white text-blue-700 font-semibold py-3 px-6 rounded-lg shadow hover:bg-gray-100 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">What We Offer</h2>
          <p className="text-gray-600 mt-2">
            Supercharge your customer engagement with AI-driven tools
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition">
            <Sparkles className="h-10 w-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Segmentation</h3>
            <p className="text-gray-600">
              Automatically group customers based on behavior and preferences.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition">
            <MessageCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Templates</h3>
            <p className="text-gray-600">
              Generate personalized, engaging message templates in seconds.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md transition">
            <BarChart3 className="h-10 w-10 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">
              Track campaign performance in real-time with detailed stats.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              See it in Action
            </h2>
            <p className="text-gray-600 mb-6">
              Our AI-powered CRM helps you create segments, launch campaigns,
              and track performance seamlessly. Here’s a quick look at your
              dashboard.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
            >
              Go to Dashboard
            </button>
          </div>

          <div className="relative rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gray-100 flex space-x-2 px-4 py-2">
              <span className="w-3 h-3 bg-red-400 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
            <img
              src="/demo-dashboard.png"
              alt="Dashboard Preview"
              className="w-full"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
              1
            </div>
            <p className="font-semibold">Create Segment</p>
          </div>
          <div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
              2
            </div>
            <p className="font-semibold">Build Campaign</p>
          </div>
          <div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
              3
            </div>
            <p className="font-semibold">Auto Send Messages</p>
          </div>
          <div>
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
              4
            </div>
            <p className="font-semibold">See Stats</p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6">
          <p>
            &copy; {new Date().getFullYear()} CRM Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/docs" className="hover:text-white">
              Docs
            </a>
            <a
              href="https://github.com/itzankitks/crm_platform"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
