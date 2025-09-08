import React from "react";

interface NavbarProps {
  userName: string;
}

const Navbar: React.FC<NavbarProps> = ({ userName }) => {
  return (
    <div className="h-16 bg-blue-500 text-white px-8 py-4 text-xl font-medium">
      <span>Welcome, {userName}</span>
    </div>
  );
};

export default Navbar;
