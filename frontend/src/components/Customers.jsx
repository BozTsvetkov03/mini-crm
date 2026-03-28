import AddCustomerForm from "./AddCustomerForm";
import LoadingSpinner from "./LoadingSpinner";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import EditCustomerModal from "./EditCustomerModal";

function Customers({
  customers,
  selectedCustomer,
  onSelectCustomer,
  loading,
  error,
  onCustomerCreated,
  searchTerm,
  onSearchChange,
  totalCustomersCount,
  onCustomerDeleted,
  onCustomerUpdated
}) {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const hasCustomers = customers.length > 0;
  const showEmptyState = !loading && !error && !hasCustomers;
  const showCustomers = !loading && !error && hasCustomers;

  const handleDeleteCustomer = (event, customer) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Delete ${customer.name} and all their tasks?`
    );

    if (confirmed) {
      onCustomerDeleted(customer.id);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Customers{" "}
          <span className="text-base font-normal text-gray-400">
            ({customers.length}
            {typeof totalCustomersCount === "number" &&
            totalCustomersCount !== customers.length
              ? ` of ${totalCustomersCount}`
              : ""}
            )
          </span>
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Search by name, email, or country.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-emerald-400"
        />
      </div>

      <AddCustomerForm onCustomerCreated={onCustomerCreated} />

      {loading && (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      )}

      {showEmptyState && (
        <div className="py-8 text-center">
          <p className="text-gray-500">
            No customers found.
            {searchTerm.trim()
              ? " Try a different search."
              : " Create one above to get started."}
          </p>
        </div>
      )}

      {showCustomers && (
        <>
          <div className="mt-6 space-y-3 md:hidden">
            {customers.map((customer) => {
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{customer.name}</p>
                  <p className="mt-1 break-all text-sm text-gray-600">
                    {customer.email}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {customer.country}
                  </p>

                  <div className="mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCustomer(customer);
                      }}
                      className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:cursor-pointer"
                      aria-label={`Edit ${customer.name}`}
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                          onClick={(e) => handleDeleteCustomer(e, customer)}
                          className="rounded-xl p-2 text-red-600 transition hover:bg-red-200 hover:cursor-pointer"
                        >
                          <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Country</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => {
                  const isSelected = selectedCustomer?.id === customer.id;

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => onSelectCustomer(customer)}
                      className={`cursor-pointer border-t transition-colors ${
                        isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">{customer.name}</td>
                      <td className="break-all px-4 py-3">{customer.email}</td>
                      <td className="px-4 py-3">{customer.country}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCustomer(customer);
                          }}
                          className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:cursor-pointer"
                          aria-label={`Edit ${customer.name}`}
                          title="Edit"
                        >
                      <Pencil size={18} />
                    </button>
                        <button
                          onClick={(e) => handleDeleteCustomer(e, customer)}
                          className="rounded-xl p-2 text-red-600 transition hover:bg-red-50 hover:cursor-pointer"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <EditCustomerModal
        customer={editingCustomer}
        open={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSave={onCustomerUpdated}
      />
    </div>
  );
}

export default Customers;