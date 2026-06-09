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
  onCustomerUpdated,
  limit,
}) {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const visibleCustomers =
    limit && !showAll ? customers.slice(0, limit) : customers;
  const hasMore = limit && !showAll && customers.length > limit;

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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-colors dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Customers{" "}
          <span className="text-base font-normal text-gray-400 dark:text-gray-500">
            ({customers.length}
            {typeof totalCustomersCount === "number" &&
            totalCustomersCount !== customers.length
              ? ` of ${totalCustomersCount}`
              : ""}
            )
          </span>
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Search by name, email, country, or company.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-emerald-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>

      <AddCustomerForm onCustomerCreated={onCustomerCreated} />

      {loading && (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {showEmptyState && (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
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
            {visibleCustomers.map((customer) => {
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200 dark:border-emerald-700 dark:bg-emerald-950/40 dark:ring-emerald-800"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{customer.name}</p>
                  <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-400">
                    {customer.email}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {customer.country}
                  </p>
                  {customer.company && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {customer.company}
                    </p>
                  )}

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

          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-gray-200 md:block dark:border-gray-800">
            <table className="w-full border-collapse text-gray-900 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Country</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleCustomers.map((customer) => {
                  const isSelected = selectedCustomer?.id === customer.id;

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => onSelectCustomer(customer)}
                      className={`cursor-pointer border-t transition-colors dark:border-gray-800 ${
                        isSelected ? "bg-emerald-50 dark:bg-emerald-950/40" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <td className="px-4 py-3">{customer.name}</td>
                      <td className="break-all px-4 py-3">{customer.email}</td>
                      <td className="px-4 py-3">{customer.country}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{customer.company || "—"}</td>
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

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Show all ({customers.length})
          </button>
        </div>
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