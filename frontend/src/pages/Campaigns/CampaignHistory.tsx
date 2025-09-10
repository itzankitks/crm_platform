import React, { useEffect, useState } from "react";
import axios from "axios";
import { GET_CAMPAIGN_ENDPOINT } from "../../utils/endPoints";

interface Campaign {
  _id: string;
  title: string;
  segmentId?: string;
  audienceSize?: number;
  createdAt?: string;
  status?: string;
}

interface CampaignWithStats extends Campaign {
  stats?: {
    total: number;
    sent: number;
    failed: number;
  };
}

const CampaignHistory: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchCampaignsAndStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get(GET_CAMPAIGN_ENDPOINT);
      const list: Campaign[] = res.data.campaigns || [];

      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

      const statsPromises = list.map(async (c) => {
        try {
          console.log("Fetching stats for campaign", c._id);
          const r = await axios.get(`${GET_CAMPAIGN_ENDPOINT}/${c._id}/stats`);
          console.log("Stats fetched for campaign", c._id, ":", r.data.stats);
          return { ...c, stats: r.data.stats };
        } catch (err) {
          console.warn("Failed to fetch stats for campaign", c._id);
          return c;
        }
      });

      const withStats = await Promise.all(statsPromises);
      setCampaigns(withStats);
    } catch (err) {
      console.error(err);
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignsAndStats();
  }, []);

  if (loading) return <div className="p-8">Loading campaigns...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Campaign History</h1>
        <div className="space-y-4">
          {campaigns.length === 0 && <div>No campaigns yet.</div>}

          {campaigns.map((c) => (
            <div key={c._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{c.title}</h2>
                  <p className="text-sm text-gray-500">
                    Audience: {c.audienceSize ?? "-"} • Status:{" "}
                    {c.status ?? "-"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Created:{" "}
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-6">
                <div>
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-xl font-medium">
                    {c.stats?.total ?? "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Delivered</div>
                  <div className="text-xl font-medium text-green-600">
                    {c.stats?.sent ?? "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Failed</div>
                  <div className="text-xl font-medium text-red-600">
                    {c.stats?.failed ?? "-"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => fetchCampaignsAndStats()}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignHistory;
