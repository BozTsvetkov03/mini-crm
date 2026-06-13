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
    <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/10 p-5">
      <h3 className="mb-5 text-lg font-semibold text-ink">Add Customer</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customer-name-input" className="mb-2 block text-sm font-medium text-ink">
            Name
          </label>

          <input
            id="customer-name-input"
            type="text"
            value={name}
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
            placeholder="Terry Davies"
            className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          />

          <div className="mt-1 text-right text-xs text-ink-muted">
            {name.length}/50
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Company <span className="text-ink-faint">(optional)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={50}
            placeholder="Company name"
            className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          />
          <div className="mt-1 text-right text-xs text-ink-muted">
            {company.length}/50
          </div>
        </div>

        <div>
          <label htmlFor="customer-email-input" className="mb-2 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="customer-email-input"
            type="email"
            value={email}
            maxLength={50}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="terry@temple.os"
            className="w-full rounded-xl border border-line-strong bg-field px-3 py-2 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          />
          <div className="mt-1 text-right text-xs text-ink-muted">
            {email.length}/50
          </div>
        </div>
        <label className="mb-2 block text-sm font-medium text-ink">
                Country
        </label>
        <CountrySelect value={country} onChange={setCountry} className="focus:border-primary"/>

        {error && (
          <p className="text-sm font-medium text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition hover:bg-primary-strong/85 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}

export default AddCustomerForm;