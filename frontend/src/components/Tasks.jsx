import AddTaskForm from "./AddTaskForm";
import LoadingSpinner from "./LoadingSpinner";

function Tasks({
  selectedCustomer,
  tasks,
  loading,
  error,
  onCompleteTask,
  onTaskCreated,
  onTaskDeleted
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 min-h-fit">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        {selectedCustomer ? `Tasks for ${selectedCustomer.name}` : "Tasks"}
      </h2>

      <AddTaskForm
        selectedCustomer={selectedCustomer}
        onTaskCreated={onTaskCreated}
      />

      {!selectedCustomer && (
        <div className="py-12 text-center">
          <p className="text-gray-500">Select a customer to view tasks.</p>
        </div>
      )}

      {selectedCustomer && loading && <LoadingSpinner />}

      {selectedCustomer && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {selectedCustomer && !loading && !error && !tasks?.length && (
        <div className="py-8 text-center">
          <p className="text-gray-500">No tasks found for current customer.</p>
        </div>
      )}

      {selectedCustomer && !!tasks?.length && (
        <ul className="space-y-3 mt-6">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p
                  className={`font-medium ${
                    task.isDone ? "line-through text-gray-400" : "text-gray-900"
                  }`}
                >
                  {task.title}
                </p>

                <p className="text-sm text-gray-500">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteTask(task.id);
                  }}
                  className="rounded-xl bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
                >
                  Complete
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const confirmed = window.confirm("Delete this task?");
                  if (confirmed) {
                    onTaskDeleted(task.id);
                  }
                }}
                className="rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;