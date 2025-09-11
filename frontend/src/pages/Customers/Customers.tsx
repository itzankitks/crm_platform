import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Upload, X, Loader2 } from "lucide-react";
import { GET_CUSTOMER_ENDPOINT } from "../../utils/endPoints";
import Loading from "../../components/Loading/Loading";
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

interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
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
  const [showCSVUploadModal, setShowCSVUploadModal] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CustomerData[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchCustomers = async () => {
    try {
      const { data: customerResp } = await axios.get(GET_CUSTOMER_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      await axios.delete(`${GET_CUSTOMER_ENDPOINT}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCustomers(customers.filter((customer) => customer._id !== id));
      showToast("Customer deleted successfully", "success");
    } catch (err) {
      setError("Failed to delete customer.");
      showToast("Failed to delete customer", "error");
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
      for (const customer of newCustomers) {
        if (!customer.name) {
          showToast("Customer name is required", "error");
          return;
        }
        if (!customer.email) {
          showToast("Customer email is required", "error");
          return;
        }
        if (!customer.phone) {
          showToast("Customer phone is required", "error");
          return;
        }
      }

      const { data } = await axios.post(
        GET_CUSTOMER_ENDPOINT,
        {
          customers: newCustomers,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      showToast(`${data.count} customers queued for creation!`, "success");
      setShowCreateModal(false);
      setNewCustomers([{ name: "", email: "", phone: "" }]);
      fetchCustomers();
    } catch (err) {
      console.error("Error creating customers:", err);
      showToast("Failed to create customers", "error");
    }
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const lines = content.split("\n");

          const dataLines = lines[0].toLowerCase().includes("name")
            ? lines.slice(1)
            : lines;

          const parsedData = dataLines
            .filter((line) => line.trim() !== "")
            .map((line) => {
              const [name, email, phone] = line
                .split(",")
                .map((item) => item.trim());
              return { name, email, phone };
            })
            .filter((item) => item.name && item.email && item.phone);

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
      const formData = new FormData();
      formData.append("csv", csvFile);

      const response = await axios.post(
        `${GET_CUSTOMER_ENDPOINT}/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      showToast(
        `${response.data.count} customers queued for creation!`,
        "success"
      );

      const newCustomersWithIds = csvPreview.map((customer) => ({
        ...customer,
        _id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        totalSpending: 0,
        countVisits: 0,
        lastActiveAt: new Date().toISOString(),
      }));

      setCustomers((prevCustomers) => [
        ...newCustomersWithIds,
        ...prevCustomers,
      ]);

      setShowCSVUploadModal(false);
      setCsvFile(null);
      setCsvPreview([]);

      const pollForUpdates = async () => {
        try {
          const { data: updatedData } = await axios.get(GET_CUSTOMER_ENDPOINT, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setCustomers(updatedData.customers || []);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
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
              + Create New Customers
            </button>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Refresh Customers
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
              {customers.map((customer) => {
                const isTempCustomer = customer._id?.startsWith("temp-");
                return (
                  <tr
                    key={customer._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isTempCustomer ? "animate-pulse bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                      {isTempCustomer && (
                        <span className="ml-2 text-xs text-blue-600">
                          (Processing...)
                        </span>
                      )}
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
                      {!isTempCustomer && (
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          onClick={() => handleDelete(customer._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No customers found
            </div>
          )}
        </div>

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

        {showCSVUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Bulk Upload Customers
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
                  Upload a CSV file with customers. The file should have
                  columns: <code>name, email, phone</code>
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Example: <code>John Doe,john@example.com,9876543210</code>{" "}
                  (one customer per line)
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
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Phone
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvPreview.map((customer, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {customer.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {customer.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {customer.phone}
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
                    "Upload Customers"
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

export default Customers;
