import { useEffect, useState } from "react";
import { getCompletedTasks } from "../api/tasksApi";
import { getApiErrorMessage } from "../api/apiError";
import LoadingSpinner from "../components/LoadingSpinner";
import SortableTaskTable from "../components/SortableTaskTable";

export default function CompletedTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCompletedTasks();
      setTasks(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="mx-auto w-[92%] pt-16 pb-16 lg:w-[80%]">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-md transition-colors">
          <h1 className="mb-6 text-2xl font-semibold text-ink">
            Completed Tasks
          </h1>

          {loading && <LoadingSpinner />}

          {!loading && error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
              <p className="font-medium text-danger">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <SortableTaskTable tasks={tasks} mode="completed" onReload={load} />
          )}
        </div>
      </div>
    </div>
  );
}
