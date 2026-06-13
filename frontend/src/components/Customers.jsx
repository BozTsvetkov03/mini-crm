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
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-md transition-colors">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">
          Customers{" "}
          <span className="text-base font-normal text-ink-faint">
            ({customers.length}
            {typeof totalCustomersCount === "number" &&
            totalCustomersCount !== customers.length
              ? ` of ${totalCustomersCount}`
              : ""}
            )
          </span>
        </h2>

        <p className="mt-1 text-sm text-ink-muted">
          Search by name, email, country, or company.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-xl border border-line-strong bg-field px-4 py-2.5 text-ink outline-none transition focus:border-primary"
        />
      </div>

      <AddCustomerForm onCustomerCreated={onCustomerCreated} />

      {loading && (
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4">
          <p className="font-medium text-danger">{error}</p>
        </div>
      )}

      {showEmptyState && (
        <div className="py-8 text-center">
          <p className="text-ink-muted">
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
                      ? "border-primary bg-primary/10 ring-2 ring-ring"
                      : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <p className="font-semibold text-ink">{customer.name}</p>
                  <p className="mt-1 break-all text-sm text-ink-muted">
                    {customer.email}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {customer.country}
                  </p>
                  {customer.company && (
                    <p className="mt-1 text-sm text-ink-muted">
                      {customer.company}
                    </p>
                  )}

                  <div className="mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCustomer(customer);
                      }}
                      className="rounded-xl p-2 text-secondary transition hover:bg-secondary/15 hover:cursor-pointer"
                      aria-label={`Edit ${customer.name}`}
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                          onClick={(e) => handleDeleteCustomer(e, customer)}
                          className="rounded-xl p-2 text-danger transition hover:bg-danger/15 hover:cursor-pointer"
                        >
                          <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 hidden overflow-x-auto rounded-xl border border-line md:block">
            <table className="w-full border-collapse text-ink">
              <thead className="bg-line">
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
                      className={`cursor-pointer border-t transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-ink/5"
                      }`}
                    >
                      <td className="px-4 py-3">{customer.name}</td>
                      <td className="break-all px-4 py-3">{customer.email}</td>
                      <td className="px-4 py-3">{customer.country}</td>
                      <td className="px-4 py-3 text-ink-muted">{customer.company || "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCustomer(customer);
                          }}
                          className="rounded-xl p-2 text-secondary transition hover:bg-secondary/15 hover:cursor-pointer"
                          aria-label={`Edit ${customer.name}`}
                          title="Edit"
                        >
                      <Pencil size={18} />
                    </button>
                        <button
                          onClick={(e) => handleDeleteCustomer(e, customer)}
                          className="rounded-xl p-2 text-danger transition hover:bg-danger/10 hover:cursor-pointer"
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
            className="rounded-xl border border-line-strong px-4 py-2 text-sm text-ink transition hover:bg-ink/5"
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