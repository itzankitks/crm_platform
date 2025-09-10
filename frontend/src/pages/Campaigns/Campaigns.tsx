import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, TrendingUp } from "lucide-react";
import axios from "axios";
import { GET_CAMPAIGN_ENDPOINT } from "../../utils/endPoints";
import Loading from "../../components/Loading/Loading";

interface Campaign {
  _id: string;
  title: string;
  status?: string;
  messageTemplate?: string;
  createdAt?: string;
  audienceSize?: number;
}

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(GET_CAMPAIGN_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCampaigns(data.campaigns || []);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getStatusColor = (status: string = "") => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Campaigns</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
            onClick={() => navigate("/campaign/create")}
          >
            + Create New Campaign
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {campaigns.length > 0 ? (
              campaigns.map((campaign, index) => (
                <div
                  key={campaign._id}
                  className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 animate-fade-in group cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {campaign.title}
                        </h3>
                        {campaign.status && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {campaign.status}
                          </span>
                        )}
                      </div>
                      {campaign.audienceSize && (
                        <p className="text-sm text-gray-500">
                          Audience: {campaign.audienceSize} customers
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/campaign/${campaign._id}`);
                      }}
                      className="inline-flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Stats
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="animate-bounce">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                </div>
                <p className="text-gray-500 font-medium">No campaigns yet</p>
                <p className="text-gray-400 text-sm">
                  Create your first campaign to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
