import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Loader2 } from "lucide-react";
import {
  GET_SEGMENTS_ENDPOINT,
  CREATE_CAMPAIGN_ENDPOINT,
} from "../../utils/endPoints";

interface Segment {
  _id: string;
  name: string;
  customerSize?: number;
}

const Campaigns: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedSegmentId = (location.state as any)?.segmentId || "";

  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [segmentId, setSegmentId] = useState(preselectedSegmentId);
  const [messageTemplate, setMessageTemplate] = useState("");

  // Fetch segments
  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(GET_SEGMENTS_ENDPOINT, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSegments(res.data.segments || []);
    } catch (err) {
      console.error("Error fetching segments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const createCampaign = async () => {
    if (!title.trim() || !segmentId || !messageTemplate.trim()) return;

    try {
      const res = await axios.post(CREATE_CAMPAIGN_ENDPOINT, {
        title,
        segmentId,
        messageTemplate,
      });
      console.log("Campaign created:", res.data);
      // Redirect to campaign list/dashboard
      navigate("/");
    } catch (err) {
      console.error("Error creating campaign:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Campaign</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Campaign Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Enter campaign title"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Select Segment
          </label>
          <select
            value={segmentId}
            onChange={(e) => setSegmentId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">-- Select Segment --</option>
            {segments.map((seg) => (
              <option key={seg._id} value={seg._id}>
                {seg.name} ({seg.customerSize || 0} users)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Message Template
          </label>
          <textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            rows={4}
            placeholder="Hi {name}, here’s a special offer for you!"
          ></textarea>
        </div>

        <button
          onClick={createCampaign}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Campaign</span>
        </button>
      </div>
    </div>
  );
};

export default Campaigns;

// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   CREATE_CAMPAIGN_ENDPOINT,
//   GET_SEGMENTS_ENDPOINT,
// } from "../../utils/endPoints";
// import Dropdown from "../../components/Dropdown/Dropdown";

// interface Segment {
//   _id: string;
//   name: string;
// }

// interface LocationState {
//   id?: string;
// }

// const Campaigns: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state as LocationState;
//   const id = state?.id;
//   console.log("segment id: ", id);

//   const [segments, setSegments] = useState<Segment[]>([]);
//   const [selectedSegment, setSelectedSegment] = useState<string>(
//     id || "Past Segments"
//   );
//   const [campaignTitle, setCampaignTitle] = useState<string>("");
//   const [messageTemplate, setMessageTemplate] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchAllSegments = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get(GET_SEGMENTS_ENDPOINT, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         const fetchedSegments = Array.isArray(response.data?.segments)
//           ? response.data.segments
//           : [];
//         setSegments(fetchedSegments);
//         console.log("Segments from fetch: ", fetchedSegments);
//       } catch (error) {
//         console.error("Error fetching segments: ", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAllSegments();
//   }, []);

//   const selectSegmentHandle = (option: string) => {
//     setSelectedSegment(option);
//   };

//   const handleCampaignSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Submit triggered");
//     if (
//       selectedSegment === "Past Segments" ||
//       campaignTitle === "" ||
//       messageTemplate === ""
//     ) {
//       alert(
//         "One or more fields are missing. Please submit a valid campaign value"
//       );
//       return;
//     }
//     try {
//       const selectedSegmentObject = id
//         ? segments.find((segment) => segment._id === selectedSegment)
//         : segments.find((segment) => segment.name === selectedSegment);

//       console.log("segment id: ", selectedSegmentObject?._id);
//       if (!selectedSegmentObject) {
//         alert("Selected segment not found");
//         return;
//       }
//       const campaignData = await axios.post(CREATE_CAMPAIGN_ENDPOINT, {
//         title: campaignTitle,
//         segmentId: selectedSegmentObject._id,
//         messageTemplate: messageTemplate,
//       });
//       console.log("Campaign Data: ", campaignData);
//       if (campaignData.status >= 200 && campaignData.status < 300) {
//         alert("Campaign has been successfully created!");
//         navigate(`/campaign/${campaignData.data.Campaign._id}`);
//       } else {
//         alert("Campaign unsuccessful");
//       }
//     } catch (error) {
//       console.error("Error in creating new campaign: ", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white flex flex-col items-center pt-16">
//       <div className="w-1/2 p-8 bg-white text-cyan-500 border-2 border-cyan-500 rounded-3xl mt-16">
//         <h3 className="text-xl font-bold mb-4">Start a new Campaign</h3>
//         <form
//           onSubmit={handleCampaignSubmit}
//           className="flex flex-col items-center"
//         >
//           <div className="w-full flex flex-row items-center mb-4">
//             <p className="mr-16 text-lg font-bold">Segment - </p>
//             {id ? (
//               <p>{selectedSegment}</p>
//             ) : loading ? (
//               <p>Loading segments...</p>
//             ) : (
//               <Dropdown
//                 label={selectedSegment}
//                 options={
//                   Array.isArray(segments)
//                     ? segments.map((data) => data.name)
//                     : []
//                 }
//                 onSelect={selectSegmentHandle}
//                 type="button"
//               />
//             )}
//           </div>
//           <div className="w-full flex flex-row items-center mb-4">
//             <p className="mr-16 text-lg font-bold">Campaign Title - </p>
//             <input
//               className="w-4/5 h-12 px-4 border-2 border-cyan-500 rounded-lg"
//               placeholder="Enter your Campaign Title"
//               value={campaignTitle}
//               onChange={(e) => setCampaignTitle(e.target.value)}
//             />
//           </div>
//           <div className="w-full mb-4">
//             <h3 className="text-lg font-bold">Message Template - </h3>
//             <p>
//               <span className="font-bold">NOTE: </span>For personalized texts
//               please write <span className="font-bold">&#123;name&#125;</span>{" "}
//               in the template
//             </p>
//             <textarea
//               className="w-[95%] min-w-[3rem] p-4 resize-y border-2 border-cyan-500 rounded-xl"
//               placeholder="Enter your Message Template"
//               value={messageTemplate}
//               onChange={(e) => setMessageTemplate(e.target.value)}
//             />
//           </div>
//           <div className="mt-8">
//             <button
//               type="submit"
//               className="w-32 p-4 text-sm font-semibold text-white bg-cyan-500 rounded-lg cursor-pointer"
//             >
//               Save
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Campaigns;
