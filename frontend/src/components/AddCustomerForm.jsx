import { useState } from "react";
import { createCustomer } from "../api/customersApi";
import { getApiErrorMessage } from "../api/apiError";

function AddCustomerForm({ onCustomerCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Customer email is required.");
      return;
    }

    if (!country.trim()) {
      setError("Customer country is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        name: name.trim(),
        email: email.trim(),
        country: country.trim(),
      };
      console.log("customer payload:", payload);

      await createCustomer(payload);

      setName("");
      setEmail("");
      setCountry("");

      await onCustomerCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="mb-5 text-lg font-semibold text-gray-900">Add Customer</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Terry Davies"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="terry@temple.os"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Bulgaria"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}

export default AddCustomerForm;
