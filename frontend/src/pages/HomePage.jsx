import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-ink transition-colors">
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
            className="anim-rise mb-8 max-w-2xl text-lg text-ink-muted md:text-xl"
            style={{ animationDelay: "0.1s" }}
          >
            A lightweight CRM to track customer interactions and stay organized.
          </p>

          <button
            onClick={() => navigate("/register")}
            style={{ animationDelay: "0.2s" }}
            className="anim-rise rounded-xl bg-primary-strong px-8 py-3 text-lg font-semibold text-white transition hover:scale-105 hover:cursor-pointer hover:bg-primary-strong/85"
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
            <p className="mx-auto mb-14 max-w-2xl text-center text-ink-muted">
              Get set up in minutes. Atelier keeps the workflow short so you can
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
      <section className="bg-surface px-6 py-24 transition-colors">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Built for people who just want to get things done
            </h2>
            <p className="text-ink-muted">
              Most CRMs drown you in features you'll never use. Atelier is
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
          <div className="mx-auto max-w-3xl rounded-3xl bg-primary-strong px-8 py-14 text-center shadow-sm">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to get organized?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/90">
              Create your free account and start managing your customers in
              minutes.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-background px-8 py-3 text-lg font-semibold text-primary-strong transition hover:scale-105 hover:cursor-pointer hover:bg-background/85"
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
    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-ink-muted">{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary-strong">
        {number}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-ink-muted">{text}</p>
    </div>
  );
}

function Benefit({ title, text }) {
  return (
    <div className="rounded-2xl border border-line p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
      <h3 className="mb-1 font-semibold text-primary-strong">
        {title}
      </h3>
      <p className="text-ink-muted">{text}</p>
    </div>
  );
}
