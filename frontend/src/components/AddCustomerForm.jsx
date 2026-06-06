import { useState } from "react";
import { createCustomer } from "../api/customersApi";
import { getApiErrorMessage } from "../api/apiError";
import CountrySelect from "./countrySelect";

function AddCustomerForm({ onCustomerCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
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

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!country) {
      setError("Customer country is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        name: name.trim(),
        email: email.trim(),
        country: country,
        company: company.trim() || null,
      };

      await createCustomer(payload);

      setName("");
      setEmail("");
      setCountry("");
      setCompany("");

      await onCustomerCreated();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
      <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-gray-100">Add Customer</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customer-name-input" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>

          <input
            id="customer-name-input"
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="Terry Davies"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-emerald-900"
          />

          <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {name.length}/50
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company <span className="text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={50}
            placeholder="Company name"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-emerald-900"
          />
          <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {company.length}/50
          </div>
        </div>

        <div>
          <label htmlFor="customer-email-input" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="customer-email-input"
            type="email"
            value={email}
            maxLength={50}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="terry@temple.os"
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-emerald-900"
          />
          <div className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {email.length}/50
          </div>
        </div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
        </label>
        <CountrySelect value={country} onChange={setCountry} className="focus:border-emerald-400"/>

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