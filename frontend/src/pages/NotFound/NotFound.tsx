import React from "react";

const NotFound: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in justify-center text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              404 - Page Not Found
            </h1>
            <p className="text-gray-600">
              Sorry, the page you are looking for does not exist.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
