import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Loading from "../../components/Loading/Loading";
import {
  GET_CUSTOMER_ENDPOINT,
  GET_ORDER_ENDPOINT,
} from "../../utils/endPoints";
import { useToast } from "../../context/toastContext";
import { Loader2, Upload, X } from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSpending: number;
  countVisits: number;
  lastActiveAt?: string;
}

interface OrderData {
  _id?: string;
  customerId: string;
  cost: number | string;
  status?: string;
  createdAt?: string;
}

const Orders: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newOrders, setNewOrders] = useState<OrderData[]>([
    { customerId: "", cost: "" },
  ]);
  const [showCSVUploadModal, setShowCSVUploadModal] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<OrderData[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await axios.get(GET_CUSTOMER_ENDPOINT);
      setCustomers(data.customers || []);
    } catch (err) {
      setError("Failed to fetch customers.");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await axios.get(GET_ORDER_ENDPOINT);
      setOrders(data.orders || []);
    } catch (err) {
      setError("Failed to fetch orders.");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCustomers(), fetchOrders()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchCustomers, fetchOrders]);

  const handleAddOrderField = () => {
    setNewOrders([...newOrders, { customerId: "", cost: "" }]);
  };

  const handleRemoveOrderField = (index: number) => {
    const updated = [...newOrders];
    updated.splice(index, 1);
    setNewOrders(updated);
  };

  const handleChange = (
    index: number,
    field: keyof OrderData,
    value: string | number
  ) => {
    const updated = [...newOrders];
    if (field === "customerId") {
      updated[index][field] = value as string;
    } else if (field === "cost") {
      updated[index][field] = value as number | "";
    }
    setNewOrders(updated);
  };

  const handleCreateOrders = async () => {
    try {
      for (const o of newOrders) {
        if (!o.customerId)
          return showToast("Select a customer for each order", "error");
        if (!o.cost || Number(o.cost) <= 0)
          return showToast("Cost must be greater than 0", "error");
      }

      const { data } = await axios.post(GET_ORDER_ENDPOINT, {
        orders: newOrders,
      });

      showToast(`${newOrders.length} orders queued for creation!`, "success");

      const newOrdersWithIds = newOrders.map((order) => ({
        ...order,
        _id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      }));

      setOrders((prevOrders) => [...newOrdersWithIds, ...prevOrders]);
      setShowCreateModal(false);
      setNewOrders([{ customerId: "", cost: "" }]);

      const pollForUpdates = async () => {
        try {
          const { data: updatedData } = await axios.get(GET_ORDER_ENDPOINT);
          setOrders(updatedData.orders || []);

          clearInterval(pollInterval);
        } catch (err) {
          console.error("Error polling for updates:", err);
        }
      };

      const pollInterval = setInterval(pollForUpdates, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
      }, 30000);
    } catch (err) {
      console.error("Error creating orders:", err);
      showToast("Failed to create orders", "error");
    }
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);

      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const lines = content.split("\n");

          // Skip header row if it exists
          const dataLines = lines[0].toLowerCase().includes("customerid")
            ? lines.slice(1)
            : lines;

          const parsedData = dataLines
            .filter((line) => line.trim() !== "")
            .map((line) => {
              const [customerId, cost] = line
                .split(",")
                .map((item) => item.trim());
              return { customerId, cost };
            })
            .filter((item) => item.customerId && item.cost);

          setCsvPreview(parsedData);
        } catch (err) {
          console.error("Error parsing CSV:", err);
          showToast("Error parsing CSV file", "error");
          setCsvPreview([]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile || csvPreview.length === 0) {
      showToast("No valid CSV data to upload", "error");
      return;
    }

    setUploading(true);
    try {
      // Prepare data for upload
      const formData = new FormData();
      formData.append("csv", csvFile);

      const response = await axios.post(
        `${GET_ORDER_ENDPOINT}/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      showToast(
        `${response.data.count} orders queued for creation!`,
        "success"
      );

      // Add temporary orders to UI
      const newOrdersWithIds = csvPreview.map((order) => ({
        ...order,
        _id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      }));

      setOrders((prevOrders) => [...newOrdersWithIds, ...prevOrders]);

      // Reset CSV upload state
      setShowCSVUploadModal(false);
      setCsvFile(null);
      setCsvPreview([]);

      // Start polling for updates
      const pollForUpdates = async () => {
        try {
          const { data: updatedData } = await axios.get(GET_ORDER_ENDPOINT);
          setOrders(updatedData.orders || []);
          clearInterval(pollInterval);
        } catch (err) {
          console.error("Error polling for updates:", err);
        }
      };

      const pollInterval = setInterval(pollForUpdates, 2000);
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 30000);
    } catch (err) {
      console.error("Error uploading CSV:", err);
      showToast("Failed to upload CSV", "error");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );

  const sortedOrders = [...orders].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0;
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <div className="flex space-x-3">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
              onClick={() => setShowCSVUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2 inline" />
              Bulk Upload CSV
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
              onClick={() => setShowCreateModal(true)}
            >
              + Create New Orders
            </button>
          </div>
        </div>

        {/* Refresh button */}
        <div className="mb-4">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Refresh Orders
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedOrders.map((order) => {
                const customer = customers.find(
                  (c) => c._id === order.customerId
                );

                const isTempOrder = order._id?.startsWith("temp-");

                return (
                  <tr
                    key={order._id}
                    className={`hover:bg-gray-50 ${
                      isTempOrder ? "animate-pulse bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order._id || "-"}
                      {isTempOrder && (
                        <span className="ml-2 text-xs text-blue-600">
                          (Processing...)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer ? customer.name : order.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.cost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.status || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : new Date().toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-6 text-center text-gray-500">No orders found</div>
          )}
        </div>

        {/* Orders Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Create New Orders
              </h2>
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {newOrders.map((order, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Customer
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={order.customerId}
                        onChange={(e) =>
                          handleChange(index, "customerId", e.target.value)
                        }
                      >
                        <option value="">-- Select Customer --</option>
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.email || c.phone || "No contact"})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cost
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={order.cost}
                        onChange={(e) =>
                          handleChange(index, "cost", Number(e.target.value))
                        }
                      />
                    </div>
                    {newOrders.length > 1 && (
                      <button
                        className="text-red-600 text-sm mt-2"
                        onClick={() => handleRemoveOrderField(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
                  onClick={handleAddOrderField}
                >
                  + Add Another
                </button>
                <div className="flex space-x-3">
                  <button
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={handleCreateOrders}
                  >
                    Create All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCSVUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Bulk Upload Orders
                </h2>
                <button
                  onClick={() => {
                    setShowCSVUploadModal(false);
                    setCsvFile(null);
                    setCsvPreview([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a CSV file with orders. The file should have columns:{" "}
                  <code>customerId</code>, <code>cost</code>
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Example: <code>customerId1,1000</code> (one order per line)
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCSVFileChange}
                  accept=".csv, text/csv"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm"
                >
                  {csvFile ? csvFile.name : "Select CSV File"}
                </button>
              </div>

              {csvPreview.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Preview:
                  </h3>
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Customer ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvPreview.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {item.customerId}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              ₹{item.cost}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowCSVUploadModal(false);
                    setCsvFile(null);
                    setCsvPreview([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVUpload}
                  disabled={!csvFile || uploading}
                  className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                    !csvFile || uploading
                      ? "bg-gray-400"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Orders"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
