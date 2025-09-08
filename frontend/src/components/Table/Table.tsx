import React from "react";
import { useNavigate } from "react-router-dom";

interface Campaign {
  _id: string;
  title: string;
}

interface Segment {
  _id: string;
  title: string;
}

interface TableProps {
  tableData: Campaign[] | Segment[];
  type: "campaign" | "segment";
}

const Table: React.FC<TableProps> = ({ tableData, type }) => {
  const navigate = useNavigate();

  return (
    <div className="h-64 w-[90vw] flex flex-col p-4 px-8 rounded-3xl border-2 border-blue-500 overflow-y-scroll">
      {tableData.map((data) => (
        <div
          className="flex flex-row justify-between items-center p-4 border-b border-blue-500"
          key={data._id}
        >
          <h3>
            {type === "campaign"
              ? (data as Campaign).title
              : (data as Segment).title}
          </h3>
          <button
            onClick={() => {
              type === "campaign"
                ? navigate(`/campaign/${data._id}`)
                : navigate("/campaign", { state: { id: data._id } });
            }}
            className="h-4 w-48 p-4 pb-8 text-base rounded-xl bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            {type === "campaign" ? "View Campaign Stats" : "Run a Campaign"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Table;
