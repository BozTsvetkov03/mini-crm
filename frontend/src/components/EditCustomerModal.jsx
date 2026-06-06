import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getNames } from "country-list";
import CountrySelect from "./countrySelect";


function EditCustomerModal({ customer, open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;

    setName(customer.name || "");
    setEmail(customer.email || "");
    setCountry(customer.country || "");
    setCompany(customer.company || "");
    setError("");
  }, [customer]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(customer.id, {
        name: name.trim(),
        email: email.trim() || null,
        country: country.trim() || null,
        company: company.trim() || null
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit customer</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-emerald-900"
              placeholder="Enter customer name"
            />
            <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {name.length}/50
          </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={50}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-emerald-900"
              placeholder="Enter email"
            />
            <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {email.length}/50
          </div>
          </div>

            <div>
              <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <CountrySelect value={country} onChange={setCountry}/>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company <span className="text-gray-400 dark:text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={50}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-emerald-900"
              placeholder="Company name"
            />
            <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {company.length}/50
          </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:cursor-pointer dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
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