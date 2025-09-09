import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CREATE_CAMPAIGN_ENDPOINT,
  GET_SEGMENTS_ENDPOINT,
} from "../../utils/endPoints";
import Dropdown from "../../components/Dropdown/Dropdown";

interface Segment {
  _id: string;
  name: string;
}

interface LocationState {
  id?: string;
}

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const id = state?.id;
  console.log("segment id: ", id);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>(
    id || "Past Segments"
  );
  const [campaignTitle, setCampaignTitle] = useState<string>("");
  const [messageTemplate, setMessageTemplate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllSegments = async () => {
      try {
        const response = await axios.get(GET_SEGMENTS_ENDPOINT);
        const fetchedSegments = Array.isArray(response.data?.segments)
          ? response.data.segments
          : [];
        setSegments(fetchedSegments);
        console.log("Segments from fetch: ", fetchedSegments);
      } catch (error) {
        console.error("Error fetching segments: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSegments();
  }, []);

  const selectSegmentHandle = (option: string) => {
    setSelectedSegment(option);
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit triggered");
    if (
      selectedSegment === "Past Segments" ||
      campaignTitle === "" ||
      messageTemplate === ""
    ) {
      alert(
        "One or more fields are missing. Please submit a valid campaign value"
      );
      return;
    }
    try {
      const selectedSegmentObject = id
        ? segments.find((segment) => segment._id === selectedSegment)
        : segments.find((segment) => segment.name === selectedSegment);

      console.log("segment id: ", selectedSegmentObject?._id);
      if (!selectedSegmentObject) {
        alert("Selected segment not found");
        return;
      }
      const campaignData = await axios.post(CREATE_CAMPAIGN_ENDPOINT, {
        title: campaignTitle,
        segmentId: selectedSegmentObject._id,
        messageTemplate: messageTemplate,
      });
      console.log("Campaign Data: ", campaignData);
      if (campaignData.status === 200) {
        alert("Campaign has been successfully created!");
        navigate(`/campaign/${campaignData.data.Campaign._id}`);
      } else {
        alert("Campaign unsuccessful");
      }
    } catch (error) {
      console.error("Error in creating new campaign: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-16">
      <div className="w-1/2 p-8 bg-white text-cyan-500 border-2 border-cyan-500 rounded-3xl mt-16">
        <h3 className="text-xl font-bold mb-4">Start a new Campaign</h3>
        <form
          onSubmit={handleCampaignSubmit}
          className="flex flex-col items-center"
        >
          <div className="w-full flex flex-row items-center mb-4">
            <p className="mr-16 text-lg font-bold">Segment - </p>
            {id ? (
              <p>{selectedSegment}</p>
            ) : loading ? (
              <p>Loading segments...</p>
            ) : (
              <Dropdown
                label={selectedSegment}
                options={
                  Array.isArray(segments)
                    ? segments.map((data) => data.name)
                    : []
                }
                onSelect={selectSegmentHandle}
                type="button"
              />
            )}
          </div>
          <div className="w-full flex flex-row items-center mb-4">
            <p className="mr-16 text-lg font-bold">Campaign Title - </p>
            <input
              className="w-4/5 h-12 px-4 border-2 border-cyan-500 rounded-lg"
              placeholder="Enter your Campaign Title"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
            />
          </div>
          <div className="w-full mb-4">
            <h3 className="text-lg font-bold">Message Template - </h3>
            <p>
              <span className="font-bold">NOTE: </span>For personalized texts
              please write <span className="font-bold">&#123;name&#125;</span>{" "}
              in the template
            </p>
            <textarea
              className="w-[95%] min-w-[3rem] p-4 resize-y border-2 border-cyan-500 rounded-xl"
              placeholder="Enter your Message Template"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
            />
          </div>
          <div className="mt-8">
            <button
              type="submit"
              className="w-32 p-4 text-sm font-semibold text-white bg-cyan-500 rounded-lg cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Campaigns;
