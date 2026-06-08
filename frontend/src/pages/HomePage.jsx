import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="hero-aurora" aria-hidden="true" />

        <div className="relative z-10 flex w-full flex-col items-center">
          <h1
            className="anim-rise mb-6 text-4xl font-bold md:text-6xl"
            style={{ animationDelay: "0s" }}
          >
            Manage your customers. Grow your business.
          </h1>

          <p
            className="anim-rise mb-8 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-400"
            style={{ animationDelay: "0.1s" }}
          >
            A lightweight CRM to track customer interactions and stay organized.
          </p>

          <button
            onClick={() => navigate("/register")}
            style={{ animationDelay: "0.2s" }}
            className="anim-rise rounded-xl bg-emerald-600 px-8 py-3 text-lg font-semibold text-white transition hover:scale-105 hover:cursor-pointer hover:bg-emerald-400 dark:hover:bg-emerald-500"
          >
            Get Started
          </button>

          <div
            className="anim-rise mt-20 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3"
            style={{ animationDelay: "0.3s" }}
          >
            <Feature title="Simple" text="No bloated features. Just what you need." />
            <Feature title="Fast" text="Built for speed and efficiency. Used for rapid customer engagement." />
            <Feature title="Focused" text="Designed to help you stay on top of your customers." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pt-12 pb-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mb-14 max-w-2xl text-center text-gray-600 dark:text-gray-400">
              Get set up in minutes. CRM-mini keeps the workflow short so you can
              spend your time on customers, not on configuration.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Step
              number="1"
              title="Add your customers"
              text="Capture contacts, companies, and countries in one organized place."
            />
            <Step
              number="2"
              title="Track tasks & notes"
              text="Log follow-ups, jot down notes, and never lose context on a conversation."
            />
            <Step
              number="3"
              title="Stay on top of activity"
              text="See a clear timeline of everything that's happened with each customer."
            />
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section className="bg-white px-6 py-24 transition-colors dark:bg-gray-900">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Built for people who just want to get things done
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Most CRMs drown you in features you'll never use. CRM-mini is
              deliberately small: a fast, focused tool that does the essentials
              well. No steep learning curve, no clutter — just a clean way to keep
              your customer relationships moving forward.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6">
            <Benefit
              title="Everything in one view"
              text="Customers, tasks, notes, and activity together — no tab juggling."
            />
            <Benefit
              title="Fast search"
              text="Find any customer instantly by name, email, company, or country."
            />
            <Benefit
              title="Light & dark"
              text="A comfortable workspace whether it's day or night."
            />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-3xl bg-emerald-600 px-8 py-14 text-center shadow-sm dark:bg-emerald-700">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to get organized?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-emerald-50">
              Create your free account and start managing your customers in
              minutes.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-white px-8 py-3 text-lg font-semibold text-emerald-700 transition hover:scale-105 hover:cursor-pointer hover:bg-emerald-50"
            >
              Get Started
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-2xl border border-emerald-200/50 bg-emerald-100/30 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:hover:border-emerald-700">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
        {number}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}

function Benefit({ title, text }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:hover:border-emerald-700">
      <h3 className="mb-1 font-semibold text-emerald-700 dark:text-emerald-400">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">{text}</p>
    </div>
  );
}
