import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  GET_CAMPAIGN_ENDPOINT,
  GET_SEGMENTS_ENDPOINT,
} from "../../utils/endPoints";
import { useParams } from "react-router-dom";
import { PieChart } from "@mui/x-charts";
import {
  MessageSquare,
  Users,
  PieChart as PieChartIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Message {
  _id: string;
  message: string;
  customerName: string;
  status: number;
}

interface Campaign {
  title: string;
  messageTemplate: string;
  status: number;
  segmentId: string;
}

interface Segment {
  customerSize: number;
}

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaignData, setCampaignData] = useState<Campaign>({} as Campaign);
  const [messages, setMessages] = useState<Message[]>([]);
  const [segmentDetails, setSegmentDetails] = useState<Segment>({} as Segment);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const getData = await axios.get(`${GET_CAMPAIGN_ENDPOINT}/${id}`);
        const fetchedCampaignData = getData.data.campaign;
        setCampaignData(fetchedCampaignData);

        if (fetchedCampaignData.segmentId) {
          const segmentId = fetchedCampaignData.segmentId;
          const getSegment = await axios.get(
            `${GET_SEGMENTS_ENDPOINT}/${segmentId}`
          );
          setSegmentDetails(getSegment.data);
        }

        setMessages(getData.data.message.flat());
      } catch (err) {
        console.error("Error fetching campaign details:", err);
        setError("Failed to load campaign details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading Campaign
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-cyan-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {campaignData.title}
            </h1>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Message Template
              </h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">
                {campaignData.messageTemplate}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Audience Size
              </h3>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {segmentDetails.customerSize || "N/A"}
              </p>
              <p className="text-sm text-gray-500 mt-1">Customers</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                Delivery Rate
              </h3>
            </div>
            <div className="flex justify-center">
              <PieChart
                colors={["#10b981", "#ef4444"]}
                series={[
                  {
                    data: [
                      {
                        value: campaignData.status || 0,
                        label: `${campaignData.status || 0}% Success`,
                      },
                      {
                        value: 100 - (campaignData.status || 0),
                        label: `${100 - (campaignData.status || 0)}% Failure`,
                      },
                    ],
                    innerRadius: 40,
                    outerRadius: 80,
                    cornerRadius: 5,
                    paddingAngle: 2,
                  },
                ]}
                width={200}
                height={150}
                slotProps={{
                  legend: {
                    // direction: "row", // Removed unsupported property
                  },
                }}
              />
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{campaignData.status || 0}% Success</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>{100 - (campaignData.status || 0)}% Failure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-500" />
              Message Delivery Status
            </h2>

            <div className="overflow-x-auto">
              <div className="min-w-full inline-block">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-t-lg border-b border-gray-200 font-semibold text-gray-700">
                  <div className="md:col-span-2">Message</div>
                  <div className="hidden md:block">Customer Name</div>
                  <div>Status</div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="md:col-span-2 text-gray-700 break-words">
                          {message.message}
                        </div>
                        <div className="hidden md:block text-gray-700">
                          {message.customerName}
                        </div>
                        <div className="flex items-center justify-center">
                          <PieChart
                            colors={["#10b981", "#ef4444"]}
                            series={[
                              {
                                data: [
                                  { value: message.status, color: "#10b981" },
                                  {
                                    value: 100 - message.status,
                                    color: "#ef4444",
                                  },
                                ],
                                innerRadius: 15,
                                outerRadius: 30,
                                cornerRadius: 3,
                                paddingAngle: 1,
                              },
                            ]}
                            width={80}
                            height={60}
                            slotProps={{
                              legend: {
                                // hidden: true,
                              },
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>No messages found for this campaign</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
