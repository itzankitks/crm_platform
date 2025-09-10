import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, X } from "lucide-react";
import SegmentForm from "./SegmentsForm";
import { GET_SEGMENTS_ENDPOINT } from "../../utils/endPoints";

interface Segment {
  _id: string;
  name: string;
  expression: string;
  createdAt: string;
  updatedAt: string;
}

const SegmentsPage: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Segments</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            <Plus className="h-4 w-4" /> Create Segment
          </button>
        </div>

        {loading ? (
          <p>Loading segments...</p>
        ) : segments.length === 0 ? (
          <p>No segments yet. Create your first segment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((seg) => (
              <div
                key={seg._id}
                className="bg-white rounded shadow p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">{seg.name}</h3>
                <p className="text-sm text-gray-600 break-words">
                  <span className="font-medium">Expression:</span>{" "}
                  {seg.expression}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Created: {new Date(seg.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>
              <SegmentForm onCreated={handleSegmentCreated} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentsPage;
