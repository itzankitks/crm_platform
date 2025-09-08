import React from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  const bg =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`px-4 py-2 rounded shadow text-white ${bg} animate-slide-in`}
    >
      {message}
    </div>
  );
};

export default Toast;
