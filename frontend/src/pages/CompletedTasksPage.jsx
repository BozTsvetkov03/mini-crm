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
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-150 transition-colors dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto w-[92%] pt-16 pb-16 lg:w-[80%]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-colors dark:border-gray-800 dark:bg-gray-900">
          <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Completed Tasks
          </h1>

          {loading && <LoadingSpinner />}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
              <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
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
