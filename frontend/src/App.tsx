function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎉 Tailwind CSS is working!
        </h1>
        <p className="text-gray-600 mb-6">
          Vite + React + TypeScript + Tailwind CSS
        </p>
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105">
          Awesome!
        </button>
      </div>
    </div>
  );
}

export default App;
