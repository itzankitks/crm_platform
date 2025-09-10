import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, Users, Eye, Play, ListOrdered } from "lucide-react";
import axios from "axios";
import {
  GET_CAMPAIGN_ENDPOINT,
  GET_SEGMENTS_ENDPOINT,
  GET_CUSTOMER_ENDPOINT,
} from "../../utils/endPoints";
import Loading from "../../components/Loading/Loading";

interface Campaign {
  _id: string;
  title: string;
  status?: string;
  messageTemplate?: string;
}

interface Segment {
  _id: string;
  name: string;
  rules: Array<{ field: string; operator: string; value: any }>;
  logic: "AND" | "OR";
}

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);

        // Fetch campaigns
        const { data: campaignResp } = await axios.get(GET_CAMPAIGN_ENDPOINT);
        setCampaignData(campaignResp.campaigns.slice(0, 4) || []);

        // Fetch segments (backend returns an array directly)
        const { data: segmentResp } = await axios.get(GET_SEGMENTS_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSegments(segmentResp.segments.slice(0, 4) || []);

        // Fetch customers
        const { data: customerResp } = await axios.get(GET_CUSTOMER_ENDPOINT);
        setCustomers(customerResp.customers || []);
      } catch (error) {
        console.log("Error in fetching Data, ", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CRM Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your campaigns, segments and customers with ease
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 animate-slide-up"
              onClick={() => navigate("/order")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-600">
                    Create Order
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ListOrdered className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Segments
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Segments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {segments.length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div> */}

            {/* Customers */}
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "200ms" }}
              onClick={() => navigate("/customers")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {customers.length.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns + Segments */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Campaigns List */}
            <div className="space-y-6 animate-slide-left">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Campaigns
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your marketing campaigns
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/campaign")}
                    className="group inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <Eye className="h-4 w-4 mr-2 transition-transform duration-200" />
                    View All
                  </button>
                </div>

                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {campaignData.length > 0 ? (
                    campaignData.map((campaign, index) => (
                      <div
                        key={campaign._id}
                        className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 animate-fade-in group cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
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
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/campaign/${campaign._id}`)
                            }
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
                      <p className="text-gray-500 font-medium">
                        No campaigns yet
                      </p>
                      <p className="text-gray-400 text-sm">
                        Create your first campaign to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Segments List */}
            <div className="space-y-6 animate-slide-right">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Segments
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Target audience segments
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/segment")}
                    className="group inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <Eye className="h-4 w-4 mr-2 transition-transform duration-200" />
                    View All
                  </button>
                </div>

                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {segments.length > 0 ? (
                    segments.map((segment, index) => (
                      <div
                        key={segment._id}
                        className="p-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 animate-fade-in group cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                              {segment.name}
                            </h3>
                            {/* <p className="text-sm text-gray-600">
                              {segment.rules.length} rules • Logic:{" "}
                              {segment.logic}
                            </p> */}
                          </div>
                          <button
                            onClick={() =>
                              navigate("/campaign", {
                                state: { id: segment._id },
                              })
                            }
                            className="inline-flex items-center px-3 py-2 text-green-600 hover:text-green-800 font-medium hover:bg-green-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Run Campaign
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="animate-bounce">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No segments yet
                      </p>
                      <p className="text-gray-400 text-sm">
                        Create your first segment to target users
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
