import api from "@/lib/axios";

export const getEmployees = () => api.get("/employees");
export const getEmployee = (id: string) => api.get(`/employees/${id}`);
export const updateEmployee = (id: string, data: unknown) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id: string) => api.delete(`/employees/${id}`);


interface VerifyPayload {
    email: string;
    code: string;
}

interface UpdateEmployeePayload {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    storeName?: string;
}

// PUT /auth/update-employee-info  (requires JWT)
// Updates employee profile — only send fields that changed
// If email changes → backend sends OTP to new email + returns message
// Returns: { message: string }
export const updateEmployeeInfo = (payload: UpdateEmployeePayload) =>
    api.put("/employees/info", payload);

// POST /auth/verify-updated-email  (requires JWT)
// Verifies OTP sent to new email after email change
// Returns: { message: string }
export const verifyUpdatedEmail = (payload: VerifyPayload) =>
    api.post("/employees/verify-updated-email", payload);