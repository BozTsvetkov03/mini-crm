import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getCustomers, deleteCustomer, updateCustomer } from "../api/customersApi";
import { getApiErrorMessage } from "../api/apiError";
import { completeTask, getTasksByCustomerId, deleteTask, updateTask, getCompletedTasks, getDueTasks } from "../api/tasksApi";
import { getNotesByCustomerId, deleteNote, updateNote } from "../api/notesApi";
import Customers from "../components/Customers";
import Tasks from "../components/Tasks";
import Notes from "../components/Notes";
import DisplayActivityList from "../components/DisplayActivityList";
import { getActivitiesByCustomerId } from "../api/activitiesApi";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("tasks");

  const [completedCount, setCompletedCount] = useState(null);
  const [dueCount, setDueCount] = useState(null);

  const [customersLoading, setCustomersLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const [customersError, setCustomersError] = useState("");
  const [tasksError, setTasksError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [activitiesError, setActivitiesError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const crmRef = useRef(null);

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      setCustomersError("");
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      setCustomersError(getApiErrorMessage(error));
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadTaskCounts = async () => {
    try {
      const [completed, due] = await Promise.all([getCompletedTasks(), getDueTasks()]);
      setCompletedCount(completed.length);
      setDueCount(due.length);
    } catch {
      // counts are non-critical; silently ignore errors
    }
  };

  const loadTasks = async (customerId) => {
    try {
      setTasksLoading(true);
      setTasksError("");
      const data = await getTasksByCustomerId(customerId);
      setTasks(data);
    } catch (error) {
      setTasksError(getApiErrorMessage(error));
    } finally {
      setTasksLoading(false);
    }
  };

  const loadNotes = async (customerId) => {
    try {
      setNotesLoading(true);
      setNotesError("");
      const data = await getNotesByCustomerId(customerId);
      setNotes(data);
    } catch (error) {
      setNotesError(getApiErrorMessage(error));
    } finally {
      setNotesLoading(false);
    }
  };

  const loadActivities = async (customerId) => {
    try {
      setActivitiesLoading(true);
      setActivitiesError("");
      const data = await getActivitiesByCustomerId(customerId);
      setActivities(data);
    } catch (error) {
      setActivitiesError(getApiErrorMessage(error));
    } finally {
      setActivitiesLoading(false);
    }
  }

  const handleSelectCustomer = (customer) => {
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(null);
    } else {
      setSelectedCustomer(customer);
    }
  };

  const handleCustomerCreated = async () => {
    await loadCustomers();
  };

  const handleTaskCreated = async () => {
    if (selectedCustomer) {
      await loadTasks(selectedCustomer.id);
    }
    await loadTaskCounts();
  };

  const handleTaskCompleted = async (taskId) => {
    try {
      await completeTask(taskId);
      if (selectedCustomer) {
        await loadTasks(selectedCustomer.id);
      }
      await loadTaskCounts();
    } catch (error) {
      setTasksError(getApiErrorMessage(error));
    }
  };

  const handleTaskDeleted = async (taskId) => {
    try {
      await deleteTask(taskId);
      if (selectedCustomer) {
        await loadTasks(selectedCustomer.id);
      }
      await loadTaskCounts();
    } catch (error) {
      setTasksError(getApiErrorMessage(error));
    }
  };

  const handleTaskUpdated = async (taskId, taskData) => {
    try {
      await updateTask(taskId, taskData);
      if (selectedCustomer) {
        const refreshedTasks = await getTasksByCustomerId(selectedCustomer.id);
        setTasks(refreshedTasks);
      }
      await loadTaskCounts();
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const handleNoteCreated = async () => {
    if (!selectedCustomer) return;
    await loadNotes(selectedCustomer.id);
  };

  const handleNoteDeleted = async (noteId) => {
    try {
      await deleteNote(noteId);
      if (selectedCustomer) {
        await loadNotes(selectedCustomer.id);
      }
    } catch (error) {
      setNotesError(getApiErrorMessage(error));
    }
  };

  const handleNoteUpdated = async (noteId, noteData) => {
    try {
      await updateNote(noteId, noteData);
      if (selectedCustomer) {
        const refreshedNotes = await getNotesByCustomerId(selectedCustomer.id);
        setNotes(refreshedNotes);
      }
    } catch (error) {
      console.error("Failed to update note:", error);
      throw error;
    }
  };

  const handleCustomerDeleted = async (customerId) => {
    try {
      await deleteCustomer(customerId);

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
        setTasks([]);
        setNotes([]);
      }

      await loadCustomers();
    } catch (error) {
      setCustomersError(getApiErrorMessage(error));
    }
  };

  const handleCustomerUpdated = async (customerId, customerData) => {
    try {
      const updatedCustomer = await updateCustomer(customerId, customerData);

      await loadCustomers();

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(updatedCustomer);
      }
    } catch (error) {
      setCustomersError(getApiErrorMessage(error));
    }
  };

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.country.toLowerCase().includes(term) ||
        (customer.company && customer.company.toLowerCase().includes(term))
      );
    });
  }, [customers, searchTerm]);

  useEffect(() => {
    loadCustomers();
    loadTaskCounts();
  }, []);

  // Deep-link from the calendar: ?customer=<id> auto-selects that customer
  // once the list has loaded, then clears the param so it only applies once.
  useEffect(() => {
    const customerId = searchParams.get("customer");
    if (!customerId || customers.length === 0) return;

    const match = customers.find((c) => c.id === customerId);
    if (match) setSelectedCustomer(match);

    setSearchParams({}, { replace: true });
  }, [customers, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedCustomer) {
      setTasks([]);
      setNotes([]);
      setActivities([]);
      return;
    }

    loadTasks(selectedCustomer.id);
    loadNotes(selectedCustomer.id);
    loadActivities(selectedCustomer.id);
  }, [selectedCustomer]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (crmRef.current && !crmRef.current.contains(event.target)) {
        setSelectedCustomer(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-150 transition-colors dark:from-gray-950 dark:to-gray-900">
      <div className="w-[92%] lg:w-[80%] mx-auto pt-16 pb-16">
        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/tasks/completed")}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-md transition hover:border-emerald-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed tasks</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount === null ? "—" : completedCount}
            </p>
          </button>

          <button
            onClick={() => navigate("/tasks/due")}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-md transition hover:border-amber-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-amber-700"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due tasks</p>
            <p className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
              {dueCount === null ? "—" : dueCount}
            </p>
          </button>
        </div>

        <div
          ref={crmRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        >
          <Customers
            customers={filteredCustomers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={handleSelectCustomer}
            loading={customersLoading}
            error={customersError}
            onCustomerCreated={handleCustomerCreated}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalCustomersCount={customers.length}
            onCustomerDeleted={handleCustomerDeleted}
            onCustomerUpdated={handleCustomerUpdated}
            limit={10}
          />

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 min-h-fit transition-colors dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {selectedCustomer ? selectedCustomer.name : "Details"}
            </h2>

            <div className="flex border-b border-gray-200 mb-6 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`px-4 py-2 text-sm font-medium transition -mb-px ${
                  activeTab === "tasks"
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-2 text-sm font-medium transition -mb-px ${
                  activeTab === "notes"
                    ? "border-b-2 border-amber-600 text-amber-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-4 py-2 text-sm font-medium transition -mb-px ${
                  activeTab === "activity"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                Activity
              </button>
            </div>

            {activeTab === "tasks" && (
              <Tasks
                selectedCustomer={selectedCustomer}
                tasks={tasks}
                loading={tasksLoading}
                error={tasksError}
                onCompleteTask={handleTaskCompleted}
                onTaskCreated={handleTaskCreated}
                onTaskDeleted={handleTaskDeleted}
                onTaskUpdated={handleTaskUpdated}
              />
            )}

            {activeTab === "notes" && (
              <Notes
                selectedCustomer={selectedCustomer}
                notes={notes}
                loading={notesLoading}
                error={notesError}
                onNoteCreated={handleNoteCreated}
                onNoteDeleted={handleNoteDeleted}
                onNoteUpdated={handleNoteUpdated}
              />
            )}

            {activeTab === "activity" && (
              <DisplayActivityList
              selectedCustomer = {selectedCustomer}
              loading={activitiesLoading}
              error={activitiesError}
              activities={activities}
              /> 
            )}
          </div>
        </div>
      </div>
    </div>
  );
}