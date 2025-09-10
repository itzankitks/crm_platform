import React, { useEffect, useState } from "react";
import axios from "axios";
import { GET_CUSTOMER_ENDPOINT } from "../../utils/endPoints";
import Loading from "../../components/Loading/Loading";

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSpending: number;
  countVisits: number;
  lastActiveAt?: string;
}

type NewCustomer = Omit<
  Customer,
  "_id" | "totalSpending" | "countVisits" | "lastActiveAt"
>;

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newCustomers, setNewCustomers] = useState<NewCustomer[]>([
    { name: "", email: "", phone: "" },
  ]);

  const fetchCustomers = async () => {
    try {
      const { data: customerResp } = await axios.get(GET_CUSTOMER_ENDPOINT);
      setCustomers(customerResp.customers || []);
    } catch (err) {
      setError("Failed to fetch customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${GET_CUSTOMER_ENDPOINT}/${id}`);
      setCustomers(customers.filter((customer) => customer._id !== id));
    } catch (err) {
      setError("Failed to delete customer.");
    }
  };

  const handleAddCustomerField = () => {
    setNewCustomers([...newCustomers, { name: "", email: "", phone: "" }]);
  };

  const handleRemoveCustomerField = (index: number) => {
    const updated = [...newCustomers];
    updated.splice(index, 1);
    setNewCustomers(updated);
  };

  const handleChange = (
    index: number,
    field: keyof NewCustomer,
    value: string
  ) => {
    const updated = [...newCustomers];
    updated[index][field] = value;
    setNewCustomers(updated);
  };

  const handleCreate = async () => {
    try {
      console.log("Creating customers:", newCustomers);
      console.log("POST to:", GET_CUSTOMER_ENDPOINT);
      const { data } = await axios.post(GET_CUSTOMER_ENDPOINT, {
        customers: newCustomers,
      });
      console.log("Create response:", data);

      alert(`${data.count} customers queued for creation!`);

      setShowCreateModal(false);
      setNewCustomers([{ name: "", email: "", phone: "" }]);

      // Optionally refetch the customer list
      fetchCustomers();
    } catch (err) {
      console.error("Error creating customers:", err);
      setError("Failed to create customers.");
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New Customers
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{customer.totalSpending.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.countVisits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastActiveAt
                      ? new Date(customer.lastActiveAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-red-600 hover:text-red-900 transition-colors"
                      onClick={() => handleDelete(customer._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Customers Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Create New Customers
            </h2>
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {newCustomers.map((cust, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      value={cust.name}
                      onChange={(e) =>
                        handleChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      value={cust.email || ""}
                      onChange={(e) =>
                        handleChange(index, "email", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      value={cust.phone || ""}
                      onChange={(e) =>
                        handleChange(index, "phone", e.target.value)
                      }
                    />
                  </div>
                  {newCustomers.length > 1 && (
                    <button
                      className="text-red-600 text-sm mt-2"
                      onClick={() => handleRemoveCustomerField(index)}
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
                onClick={handleAddCustomerField}
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
                  onClick={handleCreate}
                >
                  Create All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
