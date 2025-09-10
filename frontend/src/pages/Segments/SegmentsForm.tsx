import React, { useState } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { CREATE_SEGMENT_ENDPOINT } from "../../utils/endPoints";
import { useAuth } from "../../context/authContext";

interface Rule {
  field: "totalSpending" | "countVisits" | "lastActiveAt";
  operator: ">" | "<" | ">=" | "<=" | "=" | "!=";
  value: string;
  connector?: "AND" | "OR";
}

const SegmentsForm: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [rules, setRules] = useState<Rule[]>([
    { field: "totalSpending", operator: ">", value: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const userId = user?._id;

  const addRule = () => {
    setRules((prev) => {
      const updated = [...prev];
      if (updated.length > 0 && !updated[updated.length - 1].connector) {
        updated[updated.length - 1].connector = "AND";
      }

      updated.push({ field: "totalSpending", operator: ">", value: "" });
      return updated;
    });
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updated: Partial<Rule>) => {
    setRules(rules.map((r, i) => (i === index ? { ...r, ...updated } : r)));
  };

  const buildExpression = () => {
    return rules
      .map((r, i) => {
        const value = r.field === "lastActiveAt" ? `"${r.value}"` : r.value;
        const condition = `${r.field} ${r.operator} ${value}`;
        if (i < rules.length - 1 && r.connector) {
          return `${condition} ${r.connector}`;
        }
        return condition;
      })
      .join(" ");
  };

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Segment name is required");
    if (rules.length === 0) return alert("Add at least one rule");
    if (rules.some((r) => r.value === "")) {
      return alert("All rule values must be filled");
    }

    const expression = buildExpression();
    console.log("Expression string:", expression);

    setLoading(true);

    try {
      await axios.post(
        CREATE_SEGMENT_ENDPOINT,
        {
          name,
          expression,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setName("");
      setRules([{ field: "totalSpending", operator: ">", value: "" }]);

      if (onCreated) onCreated();
    } catch (err) {
      console.error("Error creating segment:", err);
      alert("Failed to create segment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Create Segment</h2>

      {/* Segment Name */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Segment Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* Rules */}
      <div className="mb-4" style={{ maxHeight: "32vh", overflowY: "auto" }}>
        <label className="block text-gray-700 mb-1">Rules</label>
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-center gap-2 flex-wrap">
              <select
                value={rule.field}
                onChange={(e) =>
                  updateRule(index, { field: e.target.value as Rule["field"] })
                }
                className="border rounded px-2 py-1"
              >
                <option value="totalSpending">Total Spending</option>
                <option value="countVisits">Visit Count</option>
                <option value="lastActiveAt">Last Active At</option>
              </select>

              <select
                value={rule.operator}
                onChange={(e) =>
                  updateRule(index, {
                    operator: e.target.value as Rule["operator"],
                  })
                }
                className="border rounded px-2 py-1"
              >
                <option value=">">{`>`}</option>
                <option value="<">{`<`}</option>
                <option value=">=">{`>=`}</option>
                <option value="<=">{`<=`}</option>
                <option value="=">{`=`}</option>
                <option value="!=">{`!=`}</option>
              </select>

              {rule.field === "lastActiveAt" ? (
                <input
                  type="date"
                  value={rule.value}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  className="border rounded px-2 py-1"
                />
              ) : (
                <input
                  type="number"
                  value={rule.value}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  className="border rounded px-2 py-1"
                />
              )}

              {/* Connector only if not last rule */}
              {index < rules.length - 1 && (
                <select
                  value={rule.connector || "AND"}
                  onChange={(e) =>
                    updateRule(index, {
                      connector: e.target.value as "AND" | "OR",
                    })
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}

              <button
                onClick={() => removeRule(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 />
              </button>
            </div>
          ))}

          <button
            onClick={addRule}
            className="flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <Plus /> Add Rule
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className={`bg-blue-600 text-white px-4 py-2 rounded mt-4 flex items-center ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Segment"}
      </button>
    </div>
  );
};

export default SegmentsForm;
