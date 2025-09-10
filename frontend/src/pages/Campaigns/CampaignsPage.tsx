import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Loader2, X } from "lucide-react";
import {
  GET_SEGMENTS_ENDPOINT,
  CREATE_CAMPAIGN_ENDPOINT,
} from "../../utils/endPoints";
import CustomerSelector from "./CustomerSelector";
import { generateMessageTemplates } from "../../utils/gemini";
import { useToast } from "../../context/toastContext";

interface Segment {
  _id: string;
  name: string;
  expression: string;
  userId: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  totalSpending: number;
  countVisits: number;
}

const CampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedSegmentId = (location.state as any)?.id || "";
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] =
    useState(preselectedSegmentId);
  const [messageTemplate, setMessageTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [title, setTitle] = useState("");
  const [aiTemplates, setAITemplates] = useState<string[]>([]);
  const [generatingTemplates, setGeneratingTemplates] = useState(false);
  const { showToast } = useToast();

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(GET_SEGMENTS_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSegments(res.data.segments || []);
    } catch (err) {
      console.error("Error fetching segments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersForSegment = async (segmentId: string) => {
    if (!segmentId) return;
    try {
      console.log("Fetching customers for segment:", segmentId);
      const res = await axios.get(
        `${GET_SEGMENTS_ENDPOINT}/${segmentId}/customers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAvailableCustomers(res.data.customers || []);
      setSelectedCustomers([]);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  useEffect(() => {
    if (selectedSegmentId) {
      fetchCustomersForSegment(selectedSegmentId);
    }
  }, [selectedSegmentId]);

  const handleGenerateTemplates = async () => {
    if (!selectedSegmentId || !title) {
      showToast(
        "Please select a segment and enter a campaign title first",
        "error"
      );
      return;
    }

    setGeneratingTemplates(true);
    setShowTemplateModal(true);

    try {
      const segment = segments.find((s) => s._id === selectedSegmentId);
      const templates = await generateMessageTemplates(
        title,
        segment ? segment.name : "General Audience"
      );
      setAITemplates(templates);
    } catch (error) {
      console.error("Error generating templates:", error);
      setAITemplates([
        `Hi {name}, check out our exciting ${title} campaign!`,
        `{name}, don't miss our special ${title} offer just for you!`,
        `Exclusive ${title} deal for valued customers like you, {name}!`,
      ]);
    } finally {
      setGeneratingTemplates(false);
    }
  };

  const handleSelectTemplate = (template: string) => {
    setMessageTemplate(template);
    setShowTemplateModal(false);
  };

  const handleCreateCampaign = async () => {
    if (!selectedSegmentId) return showToast("Select a segment first", "error");
    if (!messageTemplate.trim())
      return showToast("Enter a message template", "error");
    if (selectedCustomers.length === 0)
      return showToast("Select at least one customer", "error");

    setCreating(true);
    try {
      await axios.post(
        CREATE_CAMPAIGN_ENDPOINT,
        {
          title: title || `Campaign ${new Date().toLocaleString()}`,
          segmentId: selectedSegmentId,
          messageTemplate,
          customerIds: selectedCustomers.map((c) => c._id),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      showToast("Campaign created successfully!", "success");
      setMessageTemplate("");
      setSelectedSegmentId("");
      setAvailableCustomers([]);
      setSelectedCustomers([]);
      navigate("/campaign");
    } catch (err) {
      console.error("Error creating campaign:", err);
      showToast("Failed to create campaign", "error");
    } finally {
      setCreating(false);
    }
  };

  const selectedSegment = segments.find((s) => s._id === selectedSegmentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Create Campaign</h1>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Campaign Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter campaign name"
          />
        </div>

        {/* Segment Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Select Segment</label>
          <div className="flex space-x-2">
            <select
              value={selectedSegmentId}
              onChange={(e) => setSelectedSegmentId(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">-- Choose Segment --</option>
              {segments.map((seg) => (
                <option key={seg._id} value={seg._id}>
                  {seg.name} ({seg.expression})
                </option>
              ))}
            </select>
          </div>
          {selectedSegment && (
            <p className="mt-2 text-gray-600">
              Audience Size:{" "}
              <span className="font-medium">{availableCustomers.length}</span>
            </p>
          )}
        </div>

        {selectedSegmentId && (
          <CustomerSelector
            available={availableCustomers}
            selected={selectedCustomers}
            onAvailableChange={setAvailableCustomers}
            onSelectedChange={setSelectedCustomers}
          />
        )}

        <div className="mb-4 mt-6">
          <label className="block text-gray-700 mb-1">Message Template</label>
          <div className="relative">
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              rows={4}
              placeholder="Example: Hi {name}, check out our special offer!"
            ></textarea>
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Use {`{name}`} for personalization
            </div>
          </div>
          <button
            onClick={handleGenerateTemplates}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-600 transition-transform duration-150 active:scale-95 shadow-sm"
            title="Generate with AI"
            style={{ boxShadow: "0 2px 8px rgba(128,0,128,0.08)" }}
          >
            <Sparkles className="h-5 w-5 animate-bounce" />
            <span className="font-medium">Generate with AI</span>
          </button>
        </div>

        <button
          onClick={handleCreateCampaign}
          className={`bg-blue-600 text-white px-4 py-2 rounded ${
            creating ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Campaign"}
        </button>

        {/* AI Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  AI-Generated Templates
                </h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {generatingTemplates ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
                  <p className="text-gray-600">
                    Generating creative templates...
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Select a template for your "{title}" campaign targeting:
                    <span className="font-medium">
                      {" "}
                      {selectedSegment?.name}
                    </span>
                  </p>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {aiTemplates.map((template, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <p className="text-gray-800 mb-3 whitespace-pre-line">
                          {template.replace(/\{name\}/g, "John")}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Template {index + 1}
                          </span>
                          <button
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTemplate(template);
                            }}
                          >
                            Use this template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignPage;
