import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, NotebookText, Plus } from "lucide-react";
import PageList from "../components/notebook/PageList";
import NotebookSheet from "../components/notebook/NotebookSheet";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getPages,
  createPage,
  updatePage,
  deletePage,
} from "../api/notebookApi";

const LAST_PAGE_KEY = "notebook-active-page";
const SAVE_DEBOUNCE_MS = 800;

function NotebookPage() {
  const [pages, setPages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  // Which pane shows on mobile; desktop always shows both
  const [mobilePane, setMobilePane] = useState("list");

  // Autosave plumbing — refs so the debounce/flush always see latest values
  const saveTimer = useRef(null);
  const pendingRef = useRef(null); // { id, title, content } awaiting save
  const savingRef = useRef(false);

  const flush = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const pending = pendingRef.current;
    if (!pending || savingRef.current) return;

    pendingRef.current = null;
    savingRef.current = true;
    setSaveStatus("saving");
    try {
      const updated = await updatePage(pending.id, pending.title, pending.content);
      setPages((prev) =>
        prev.map((p) =>
          p.id === updated.id ? { ...p, updatedAt: updated.updatedAt } : p
        )
      );
      setSaveStatus("saved");
    } catch {
      // Keep the edit queued so a later flush retries it
      pendingRef.current = pending;
      setSaveStatus("idle");
    } finally {
      savingRef.current = false;
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
  }, [flush]);

  // Flush on tab close / unmount so the last edits aren't lost
  const flushRef = useRef(flush);
  flushRef.current = flush;
  useEffect(() => {
    const onBeforeUnload = () => flushRef.current();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      flushRef.current();
    };
  }, []);

  // Initial load
  useEffect(() => {
    getPages()
      .then((data) => {
        setPages(data);
        const saved = localStorage.getItem(LAST_PAGE_KEY);
        const exists = data.some((p) => p.id === saved);
        setActiveId(exists ? saved : data[0]?.id ?? null);
      })
      .catch(() => setError("Couldn't load your notebook."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeId) localStorage.setItem(LAST_PAGE_KEY, activeId);
  }, [activeId]);

  const handleChange = (title, content) => {
    setPages((prev) =>
      prev.map((p) => (p.id === activeId ? { ...p, title, content } : p))
    );
    pendingRef.current = { id: activeId, title, content };
    setSaveStatus("idle");
    scheduleSave();
  };

  const handleSelect = async (id) => {
    if (id === activeId) {
      setMobilePane("editor");
      return;
    }
    await flush();
    setSaveStatus("idle");
    setActiveId(id);
    setMobilePane("editor");
  };

  const handleNew = async () => {
    await flush();
    setCreating(true);
    setError("");
    try {
      const page = await createPage("", "");
      setPages((prev) => [...prev, page]);
      setSaveStatus("idle");
      setActiveId(page.id);
      setMobilePane("editor");
    } catch {
      setError("Couldn't create a new page.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page? This can't be undone.")) return;
    try {
      await deletePage(id);
      const remaining = pages.filter((p) => p.id !== id);
      setPages(remaining);
      if (id === activeId) {
        pendingRef.current = null; // drop unsaved edits for the deleted page
        setActiveId(remaining[0]?.id ?? null);
        setMobilePane(remaining.length ? "editor" : "list");
      }
    } catch {
      setError("Couldn't delete the page.");
    }
  };

  const activePage = pages.find((p) => p.id === activeId) ?? null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center gap-2">
          <NotebookText size={22} className="text-primary-strong" />
          <h1 className="font-heading text-2xl font-bold text-ink">Notebook</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid h-[78vh] overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[16rem_1fr]">
            {/* Page list */}
            <aside
              className={`${
                mobilePane === "editor" ? "hidden" : "flex"
              } flex-col md:flex md:border-r md:border-line`}
            >
              <PageList
                pages={pages}
                activeId={activeId}
                onSelect={handleSelect}
                onNew={handleNew}
                onDelete={handleDelete}
                creating={creating}
              />
            </aside>

            {/* Editor */}
            <section
              className={`${
                mobilePane === "list" ? "hidden" : "flex"
              } h-full flex-col md:flex`}
            >
              {activePage ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMobilePane("list")}
                    className="flex items-center gap-1 px-4 pt-3 text-sm font-medium text-ink-muted transition hover:cursor-pointer hover:text-ink md:hidden"
                  >
                    <ChevronLeft size={16} /> Pages
                  </button>
                  <div key={activePage.id} className="page-turn flex min-h-0 flex-1 flex-col">
                    <NotebookSheet
                      page={activePage}
                      onChange={handleChange}
                      onFlush={flush}
                      saveStatus={saveStatus}
                    />
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                  <NotebookText size={40} className="text-ink-faint" />
                  <p className="text-ink-muted">
                    Your notebook is empty. Create your first page to start
                    writing.
                  </p>
                  <button
                    type="button"
                    onClick={handleNew}
                    disabled={creating}
                    className="flex items-center gap-2 rounded-xl bg-primary-strong px-5 py-2 font-medium text-white transition hover:cursor-pointer hover:bg-primary-strong/85 disabled:opacity-60"
                  >
                    <Plus size={18} /> New page
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default NotebookPage;
