import { Loader2 } from "lucide-react";

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600 font-medium">Loading Please Wait...</p>
      </div>
    </div>
  );
};

export default Loading;
