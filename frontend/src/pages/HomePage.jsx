import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import {
  Feather,
  LayoutGrid,
  Compass,
  Users,
  CalendarDays,
  Timer,
  NotebookText,
  Boxes,
  Palette,
  Headphones,
  MonitorSmartphone,
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-ink transition-colors">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="hero-aurora" aria-hidden="true" />

        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
          <p
            className="anim-rise mb-5 font-brand text-xl italic text-ink-muted"
            style={{ animationDelay: "0s" }}
          >
            Your personal workspace
          </p>

          <h1
            className="anim-rise mb-6 text-4xl font-bold tracking-tight md:text-6xl"
            style={{ animationDelay: "0.1s" }}
          >
            A quieter way to organize your work.
          </h1>

          <p
            className="anim-rise mb-8 max-w-xl text-lg text-ink-muted md:text-xl"
            style={{ animationDelay: "0.2s" }}
          >
            Everything you need to plan, focus, and stay on top of your
            projects — without the noise of traditional productivity tools.
          </p>

          <button
            onClick={() => navigate("/register")}
            style={{ animationDelay: "0.3s" }}
            className="anim-rise rounded-xl bg-primary-strong px-8 py-3 text-lg font-semibold text-white transition hover:scale-105 hover:cursor-pointer hover:bg-primary-strong/85"
          >
            Get started
          </button>
        </div>
      </section>

      {/* Three pillars */}
      <section className="px-6 py-24">
        <Reveal className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-3">
          <Pillar
            icon={Feather}
            title="Calm"
            text="A workspace designed to reduce clutter and help you think clearly."
          />
          <Pillar
            icon={LayoutGrid}
            title="Organized"
            text="Keep notes, clients, schedules, and tasks connected in one place."
          />
          <Pillar
            icon={Compass}
            title="Intentional"
            text="Built around focus, not endless features and distractions."
          />
        </Reveal>
      </section>

      {/* Features */}
      <section className="bg-surface px-6 py-24 transition-colors">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mx-auto mb-14 max-w-2xl text-center text-ink-muted">
              Atelier combines the essential tools for productive work in a
              single, distraction-free workspace.
            </p>
          </Reveal>

          <Reveal className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Users}
              title="CRM"
              text="Manage clients, conversations, and follow-ups without the complexity of traditional CRMs."
            />
            <FeatureCard
              icon={CalendarDays}
              title="Calendar"
              text="See your schedule at a glance and keep important commitments visible."
            />
            <FeatureCard
              icon={Timer}
              title="Focus sessions"
              text="Use the built-in Pomodoro timer and ambient lofi music to enter deep work faster."
            />
            <FeatureCard
              icon={NotebookText}
              title="Notebook"
              text="Capture ideas, meeting notes, and thoughts before they disappear."
            />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="mb-14 text-center text-3xl font-bold md:text-4xl">
              How Atelier works
            </h2>
          </Reveal>

          <Reveal className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <Step
              number="1"
              title="Organize your world"
              text="Bring together your clients, notes, tasks, and schedule in one place."
            />
            <Step
              number="2"
              title="Focus on what matters"
              text="Start a focus session, put on some lofi, and work without distractions."
            />
            <Step
              number="3"
              title="Build momentum"
              text="Stay consistent with a clear overview of what's next and what you've accomplished."
            />
          </Reveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-surface px-6 py-28 transition-colors">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="mb-8 text-3xl font-bold md:text-4xl">
              Designed for people who value calm productivity
            </h2>
            <p className="mb-6 text-ink-muted">
              Most productivity tools try to become your entire life. They add
              more features, more notifications, and more complexity.
            </p>
            <p className="mb-6 font-brand text-2xl italic text-ink md:text-3xl">
              Atelier takes a different approach.
            </p>
            <p className="text-ink-muted">
              It&apos;s a thoughtfully designed workspace that helps you stay
              organized, focused, and present. A place where your notes,
              clients, schedule, and focus sessions live together — without
              overwhelming you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-6 py-24">
        <Reveal className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Highlight
            icon={Boxes}
            title="One workspace"
            text="Notes, clients, calendar, and focus tools working together."
          />
          <Highlight
            icon={Palette}
            title="Beautiful by default"
            text="A clean environment inspired by creative studios and notebooks."
          />
          <Highlight
            icon={Headphones}
            title="Focus built in"
            text="Pomodoro sessions and ambient music whenever you need deep concentration."
          />
          <Highlight
            icon={MonitorSmartphone}
            title="Available everywhere"
            text="Pick up where you left off, whether you're planning, writing, or meeting with clients."
          />
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-28">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-3xl bg-primary-strong px-8 py-16 text-center shadow-sm">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Make space for meaningful work.
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/90">
              Join Atelier and create a workspace that helps you stay organized,
              focused, and calm.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-background px-8 py-3 text-lg font-semibold text-primary-strong transition hover:scale-105 hover:cursor-pointer hover:bg-background/85"
            >
              Start free
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function Pillar({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-strong">
        <Icon size={22} />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-ink-muted">{text}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="h-full rounded-2xl border border-line bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-strong">
        <Icon size={22} />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-ink-muted">{text}</p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="text-center">
      <p className="mb-3 font-brand text-5xl italic text-primary-strong">
        {number}
      </p>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-ink-muted">{text}</p>
    </div>
  );
}

function Highlight({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
        <Icon size={20} />
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-ink-muted">{text}</p>
    </div>
  );
}
