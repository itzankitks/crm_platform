import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Eye, Users, Play, X } from "lucide-react";
import { GET_SEGMENTS_ENDPOINT } from "../../utils/endPoints";
import Loading from "../../components/Loading/Loading";
import SegmentsForm from "./SegmentsForm";

interface Segment {
  _id: string;
  name: string;
  expression: string;
  createdAt: string;
  updatedAt: string;
  audienceSize?: number;
}

const SegmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(GET_SEGMENTS_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSegments(response.data.segments || []);
    } catch (err) {
      console.error("Error fetching segments:", err);
      setError("Failed to fetch segments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleSegmentCreated = () => {
    fetchSegments();
    setShowModal(false);
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Segments</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
          >
            + Create New Segment
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {segments.length > 0 ? (
              segments.map((segment, index) => (
                <div
                  key={segment._id}
                  className="p-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 animate-fade-in group cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                          {segment.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Expression:</span>{" "}
                        {segment.expression}
                      </p>
                      {segment.audienceSize && (
                        <p className="text-sm text-gray-500">
                          Audience: {segment.audienceSize} customers
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/campaign/create", {
                            state: { id: segment._id },
                          });
                        }}
                        className="inline-flex items-center px-3 py-2 text-green-600 hover:text-green-800 font-medium hover:bg-green-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Campaign
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="animate-bounce">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                </div>
                <p className="text-gray-500 font-medium">No segments yet</p>
                <p className="text-gray-400 text-sm">
                  Create your first segment to target specific audiences
                </p>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
              <SegmentsForm onCreated={handleSegmentCreated} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentsPage;
