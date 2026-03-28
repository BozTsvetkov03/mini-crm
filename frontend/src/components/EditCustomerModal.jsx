import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getNames } from "country-list";
import CountrySelect from "./countrySelect";


function EditCustomerModal({ customer, open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;

    setName(customer.name || "");
    setEmail(customer.email || "");
    setCountry(customer.country || "");
    setError("");
  }, [customer]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(customer.id, {
        name: name.trim(),
        email: email.trim() || null,
        country: country.trim() || null
      });

      onClose();
    } catch (err) {
      setError("Failed to update customer");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit customer</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter email"
            />
          </div>

            <div>
              <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Country
              </label>
              <CountrySelect value={country} onChange={setCountry}/>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomerModal;