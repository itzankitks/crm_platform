import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loading from "../../components/Loading/Loading";
import { GET_CAMPAIGN_ENDPOINT } from "../../utils/endPoints";

interface Campaign {
  _id: string;
  title: string;
  status: string;
  messageTemplate: string;
  createdAt: string;
  audienceSize: number;
}

interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

interface CampaignResponse {
  campaign: Campaign;
  stats: CampaignStats;
}

const COLORS = ["#22c55e", "#ef4444", "#eab308", "#94a3b8"];

const CampaignDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState<CampaignResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${GET_CAMPAIGN_ENDPOINT}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCampaignData(data);
      } catch (err) {
        console.error("Error fetching campaign details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading) return <Loading />;
  if (!campaignData)
    return (
      <div className="text-center py-10 text-red-500">Campaign not found</div>
    );

  const { campaign, stats } = campaignData;

  const chartData = [
    { name: "Sent", value: stats.sent },
    { name: "Failed", value: stats.failed },
    { name: "Pending", value: stats.pending },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </button>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {campaign.title}
          </h1>
          <p className="text-gray-500 mb-4">{campaign.messageTemplate}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold capitalize">
                {campaign.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-lg font-semibold">
                {new Date(campaign.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Audience Size</p>
              <p className="text-lg font-semibold">{campaign.audienceSize}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Delivery Stats
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Sent</p>
              <p className="text-2xl font-bold text-green-800">{stats.sent}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-800">{stats.failed}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">
                {stats.pending}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
            </div>
          </div>

          {stats.total > 0 ? (
            <div className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No message stats available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
