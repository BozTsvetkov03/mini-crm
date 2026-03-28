import { useEffect, useState, useRef, useMemo } from "react";
import { getCustomers, deleteCustomer, updateCustomer } from "../api/customersApi";
import { getApiErrorMessage } from "../api/apiError";
import { completeTask, getTasksByCustomerId, deleteTask, updateTask } from "../api/tasksApi";
import Customers from "../components/Customers";
import Tasks from "../components/Tasks";

export default function DashboardPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [customersLoading, setCustomersLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [customersError, setCustomersError] = useState("");
  const [tasksError, setTasksError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

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
    if (!selectedCustomer) return;
    await loadTasks(selectedCustomer.id);
  };

  const handleTaskCompleted = async (taskId) => {
    try {
      await completeTask(taskId);
      if (selectedCustomer) {
        await loadTasks(selectedCustomer.id);
      }
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
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const handleCustomerDeleted = async (customerId) => {
    try {
      await deleteCustomer(customerId);

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
        setTasks([]);
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
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      setTasks([]);
      return;
    }

    loadTasks(selectedCustomer.id);
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
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-150">
      <div className="w-[92%] lg:w-[80%] mx-auto pt-16 pb-16">
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
          />

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
        </div>
      </div>
    </div>
  );
}