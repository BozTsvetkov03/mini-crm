import { Link } from "react-router-dom";
import { useState } from "react";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((state) => ({
      ...state,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted:", formData);
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-600">
          Log in to continue managing your customers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-emerald-700"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;