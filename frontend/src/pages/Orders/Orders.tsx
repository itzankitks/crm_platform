import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Loading from "../../components/Loading/Loading";
import {
  GET_CUSTOMER_ENDPOINT,
  GET_ORDER_ENDPOINT,
} from "../../utils/endPoints";
import { useToast } from "../../context/toastContext";

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
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New Orders
          </button>
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
      </div>
    </div>
  );
};

export default Orders;
