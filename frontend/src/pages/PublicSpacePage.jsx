import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { getSettings, updatePublicSpace } from "../api/settingsApi";
import { getPublicFeed } from "../api/publicSpaceApi";
import { getApiErrorMessage } from "../api/apiError";
import GoPublicModal from "../components/public/GoPublicModal";
import LoadingSpinner from "../components/LoadingSpinner";

// Turns a content-free event into a human sentence. The backend never sends
// titles or bodies, so everything shown here is derived from the type alone.
function describe(ev) {
  switch (ev.type) {
    case "FocusSessionCompleted":
      return {
        icon: "⏱️",
        text: ev.durationMinutes
          ? `finished a ${ev.durationMinutes}-minute focus session`
          : "finished a focus session",
      };
    case "NotebookPageCreated":
      return { icon: "📄", text: "started a new notebook page" };
    case "NotebookWrote":
      return { icon: "✍️", text: "wrote in their notebook" };
    case "TaskCreated":
      return { icon: "🎯", text: "created a task" };
    case "TaskCompleted":
      return { icon: "✅", text: "completed a task" };
    default:
      return { icon: "📌", text: "did something" };
  }
}

function timeAgo(iso) {
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function PublicSpacePage() {
  const [enabled, setEnabled] = useState(null); // null while loading settings
  const [feed, setFeed] = useState(null); // null while loading feed
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function loadFeed() {
    setError("");
    try {
      const data = await getPublicFeed();
      setFeed(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((s) => {
        if (cancelled) return;
        setEnabled(s.publicSpaceEnabled);
        if (s.publicSpaceEnabled) loadFeed();
      })
      .catch(() => {
        if (!cancelled) {
          setEnabled(false);
          setError("Failed to load the public space.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function confirmGoPublic() {
    setConfirming(true);
    try {
      await updatePublicSpace(true);
      setEnabled(true);
      setModalOpen(false);
      await loadFeed();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-6 py-10 transition-colors">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Globe size={22} className="text-primary-strong" />
          <h1 className="text-3xl font-bold text-ink">Public space</h1>
        </div>

        {enabled === null ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : !enabled ? (
          // Gate: reciprocal — you have to opt in to look.
          <section className="rounded-2xl border border-line bg-surface p-8 text-center shadow-sm transition-colors">
            <p className="text-ink-muted">
              The public space is a calm, shared timeline of what other Atelier
              users are quietly working on. It&apos;s off by default — turn it on
              to join in and see everyone&apos;s activity.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-6 rounded-xl bg-primary-strong px-5 py-2 font-medium text-white transition hover:bg-primary-strong/85 hover:cursor-pointer"
            >
              Go Public!
            </button>
          </section>
        ) : feed === null ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : feed.length === 0 ? (
          <div className="rounded-xl border border-line bg-secondary/10 p-6 text-center text-ink-muted">
            Quiet right now — be the first.
          </div>
        ) : (
          <ul className="space-y-3">
            {feed.map((ev, i) => {
              const { icon, text } = describe(ev);
              return (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div className="text-ink">
                      <span className="font-semibold">{ev.userName}</span>{" "}
                      <span className="text-ink-muted">{text}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {timeAgo(ev.occurredAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {error && <p className="text-sm font-medium text-danger">{error}</p>}
      </div>

      <GoPublicModal
        open={modalOpen}
        confirming={confirming}
        onConfirm={confirmGoPublic}
        onCancel={() => setModalOpen(false)}
      />
    </main>
  );
}

export default PublicSpacePage;
