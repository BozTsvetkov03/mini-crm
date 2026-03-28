import { useEffect, useState, useRef, useMemo } from "react";
import { getCustomers, deleteCustomer, updateCustomer } from "./api/customersApi";
import { getApiErrorMessage } from "./api/apiError";
import { completeTask, getTasksByCustomerId, deleteTask, updateTask } from "./api/tasksApi";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/Dashboard";
import PublicLayout from "./components/PublicLayout";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";


function App() {


  return (
    <Routes>
      <Route element={<PublicLayout/>}>
            <Route path="/" element={<HomePage/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/app" element={<DashboardPage/>} />
      </Route>

    </Routes>


  )
}

export default App;