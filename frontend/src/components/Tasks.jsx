import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import AddTaskForm from "./AddTaskForm";
import LoadingSpinner from "./LoadingSpinner";
import EditTaskModal from "./EditTaskModal";

function Tasks({
  selectedCustomer,
  tasks,
  loading,
  error,
  onCompleteTask,
  onTaskCreated,
  onTaskDeleted,
  onTaskUpdated
}) {
  const [editingTask, setEditingTask] = useState(null);

  return (
    <>
      <AddTaskForm
        selectedCustomer={selectedCustomer}
        onTaskCreated={onTaskCreated}
      />

      {!selectedCustomer && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Select a customer to view tasks.</p>
        </div>
      )}

      {selectedCustomer && loading && <LoadingSpinner />}

      {selectedCustomer && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 dark:bg-red-950/40 dark:border-red-900">
          <p className="text-red-700 font-medium dark:text-red-400">{error}</p>
        </div>
      )}

      {selectedCustomer && !loading && !error && !tasks?.length && (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No tasks found for current customer.</p>
        </div>
      )}

      {selectedCustomer && !!tasks?.length && (
        <ul className="space-y-3 mt-6">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800"
            >
              <div>
                <p
                  className={`font-medium ${
                    task.isDone ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {task.title}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleString()
                    : "No due date"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {task.isDone && (
                  <span className="text-sm font-medium text-green-600">
                    Completed
                  </span>
                )}

                {!task.isDone && (
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className="rounded-xl p-2 text-green-600 transition hover:bg-green-50 hover:cursor-pointer"
                    aria-label={`Complete ${task.title}`}
                    title="Complete"
                  >
                    <Check size={18} />
                  </button>
                )}

                <button
                  onClick={() => setEditingTask(task)}
                  className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:cursor-pointer"
                  aria-label={`Edit ${task.title}`}
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => {
                    const confirmed = window.confirm("Delete this task?");
                    if (confirmed) onTaskDeleted(task.id);
                  }}
                  className="rounded-xl p-2 text-red-600 transition hover:bg-red-50 hover:cursor-pointer"
                  aria-label={`Delete ${task.title}`}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditTaskModal
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={onTaskUpdated}
      />
    </>
  );
}

export default Tasks;