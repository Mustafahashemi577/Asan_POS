import api from "@/lib/axios";
import type { EditProfile, Verify } from "@/types";

export const getEmployees = () => api.get("/employees");
export const getEmployee = (id: string) => api.get(`/employees/${id}`);
export const deleteEmployee = (id: string) => api.delete(`/employees/${id}`);

// Updates employee profile — only send fields that changed
// If email changes → backend sends OTP to new email + returns message
// Returns: { message: string }
export const updateEmployeeInfo = (payload: EditProfile) =>
  api.put("/employees/info", payload);

// Verifies OTP sent to new email after email change
// Returns: { message: string }
export const verifyUpdatedEmail = (payload: Verify) =>
  api.post("/employees/verify-updated-email", payload);
