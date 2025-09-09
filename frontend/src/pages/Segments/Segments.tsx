import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Save, Send, TrendingUp, Eye, AlertCircle } from "lucide-react";
import {
  CREATE_SEGMENT_ENDPOINT,
  GET_CUSTOMER_ENDPOINT,
} from "../../utils/endPoints";
import Dropdown from "../../components/Dropdown/Dropdown";

interface Customer {
  _id: string;
  name: string;
  totalSpending: number;
  countVisits: number;
}

const Segments: React.FC = () => {
  const navigate = useNavigate();
  const [totalSpendingComparator, setTotalSpendingComparator] =
    useState<string>("Select Operators");
  const [logicalOperator, setLogicalOperator] =
    useState<string>("Select Conjunction");
  const [visitComparator, setVisitComparator] =
    useState<string>("Select Operators");
  const [totalSpending, setTotalSpending] = useState<string>("");
  const [totalVisits, setTotalVisits] = useState<string>("");
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [segmentName, setSegmentName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const spendingComparatorHandle = (option: string) => {
    setTotalSpendingComparator(option);
    console.log("Selected Option: ", option);
  };

  const joiningHandle = (option: string) => {
    setLogicalOperator(option);
    console.log("Selected Option: ", option);
  };

  const visitComparatorHandle = (option: string) => {
    setVisitComparator(option);
    console.log("Selected Option: ", option);
  };

  const handleSegmentSubmit = async (segment: React.FormEvent) => {
    segment.preventDefault();
    setIsLoading(true);
    console.log("Submit triggered");

    const segmentSummary = `totalSpending ${totalSpendingComparator} ${totalSpending} ${logicalOperator} orderCount ${visitComparator} ${totalVisits}`;

    console.log(segmentSummary);

    if (
      segmentSummary ===
      "totalSpending Select Operators  Select Conjunction orderCount Select Operators "
    ) {
      alert("Please submit a valid segment query");
      setIsLoading(false);
      return;
    }

    try {
      const segmentData = await axios.post(
        CREATE_SEGMENT_ENDPOINT,
        {
          name: segmentName,
          query: segmentSummary,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(segmentData.data);

      const fetchSegmentCandidates =
        segmentData.data.saveSegment.customerIds || [];
      setTotalCustomers(segmentData.data.saveSegment.customerSize);
      console.log(fetchSegmentCandidates);

      if (fetchSegmentCandidates.length === 0) {
        alert("No customers found for this segment.");
        setIsLoading(false);
        return;
      }

      const validCustomerIds = fetchSegmentCandidates.filter(
        (id: string) => id !== null && id !== undefined
      );

      const customerProms = validCustomerIds.map((customerId: string) =>
        axios.get(`${GET_CUSTOMER_ENDPOINT}/${customerId}`)
      );

      const customers = await Promise.all(
        customerProms.map((promise: Promise<any>) =>
          promise.catch((err) => {
            console.error(`Error in customer data: ${err.message}`);
            return null;
          })
        )
      );

      const customerDetails = customers
        .filter((data) => data !== null)
        .map((response) => response.data);

      setCustomerData(customerDetails);
    } catch (error) {
      console.log("Error in submitting segment: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-16">
      <div className="max-w-max mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Create A New Segment
            </h1>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 lg:p-8">
            <form
              onSubmit={handleSegmentSubmit}
              className="space-y-6 lg:space-y-8"
            >
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-700">
                  Segment Name
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive segment name"
                  className="
                    w-full max-w-md px-4 py-3 text-base
                    border-2 border-gray-200 rounded-xl
                    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 focus:ring-opacity-50
                    transition-all duration-200 ease-in-out
                    hover:border-gray-300
                  "
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                  Define Segment Criteria
                </h3>

                <div className="hidden lg:flex justify-center">
                  <div className="flex items-center gap-2 text-base flex-wrap">
                    <span className="font-bold text-gray-600">
                      Customers with:
                    </span>
                    <span className="font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">
                      Total Spending
                    </span>
                    <Dropdown
                      label={totalSpendingComparator}
                      options={[">", "<", "=", ">=", "<="]}
                      onSelect={spendingComparatorHandle}
                      type="button"
                    />
                    <span className="text-gray-600">INR</span>
                    <input
                      type="number"
                      placeholder="Target spending"
                      className="w-40 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                      value={totalSpending}
                      onChange={(e) => setTotalSpending(e.target.value)}
                      required
                    />
                    <Dropdown
                      label={logicalOperator}
                      options={["AND", "OR"]}
                      onSelect={joiningHandle}
                      type="button"
                    />
                    <span className="font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                      visits
                    </span>
                    <Dropdown
                      label={visitComparator}
                      options={[">", "<", "=", ">=", "<="]}
                      onSelect={visitComparatorHandle}
                      type="button"
                    />
                    <input
                      type="number"
                      placeholder="Count"
                      className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                      value={totalVisits}
                      onChange={(e) => setTotalVisits(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="lg:hidden space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                      Total Spending Criteria
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                      <span className="text-sm text-gray-600 col-span-full sm:col-span-1">
                        Amount should be
                      </span>
                      <Dropdown
                        label={totalSpendingComparator}
                        options={[">", "<", "=", ">=", "<="]}
                        onSelect={spendingComparatorHandle}
                        type="button"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">INR</span>
                        <input
                          type="number"
                          placeholder="Amount"
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 text-sm"
                          value={totalSpending}
                          onChange={(e) => setTotalSpending(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Dropdown
                      label={logicalOperator}
                      options={["AND", "OR"]}
                      onSelect={joiningHandle}
                      type="button"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      Visit Count Criteria
                    </h4>
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <span className="text-sm text-gray-600">
                        Visits should be
                      </span>
                      <Dropdown
                        label={visitComparator}
                        options={[">", "<", "=", ">=", "<="]}
                        onSelect={visitComparatorHandle}
                        type="button"
                      />
                      <span className="text-sm text-gray-600">Count</span>
                      <input
                        type="number"
                        placeholder="Number"
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-cyan-500 text-sm"
                        value={totalVisits}
                        onChange={(e) => setTotalVisits(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !segmentName.trim()}
                  className="
                    flex items-center gap-2 px-6 py-3 
                    bg-gradient-to-r from-cyan-500 to-blue-500 
                    hover:from-cyan-600 hover:to-blue-600
                    text-white font-semibold rounded-lg
                    shadow-lg hover:shadow-xl
                    transition-all duration-200 ease-in-out
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transform hover:scale-105 active:scale-95
                  "
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Segment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Segment Results
                  </h2>
                  <p className="text-sm text-gray-500">
                    Total Customers:
                    <span className="ml-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-semibold rounded-full">
                      {totalCustomers}
                    </span>
                  </p>
                </div>
              </div>

              {totalCustomers > 0 && (
                <button
                  onClick={() => navigate("/campaign")}
                  className="
                    flex items-center gap-2 px-6 py-3
                    bg-gradient-to-r from-purple-500 to-pink-500
                    hover:from-purple-600 hover:to-pink-600
                    text-white font-semibold rounded-lg
                    shadow-lg hover:shadow-xl
                    transition-all duration-200 ease-in-out
                    transform hover:scale-105 active:scale-95
                  "
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Create New Campaign</span>
                  <span className="sm:hidden">Campaign</span>
                </button>
              )}
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {customerData.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid gap-4 p-4">
                    {customerData.map((customer, index) => (
                      <div
                        key={customer._id || index}
                        className="
                          p-4 bg-gradient-to-r from-cyan-50 to-blue-50 
                          border border-cyan-200 rounded-xl
                          hover:from-cyan-100 hover:to-blue-100
                          transition-all duration-200 ease-in-out
                          transform hover:scale-102
                        "
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {customer.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Customer ID: {customer._id}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-green-700">
                                Spending:
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                                ₹{customer.totalSpending.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-blue-700">
                                Visits:
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                                {customer.countVisits}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No Results Yet
                      </h3>
                      <p className="text-gray-500">
                        Create a segment to see matching customers here
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Segments;
