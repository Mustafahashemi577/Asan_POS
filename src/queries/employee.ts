import api from "@/lib/axios";

export const getEmployees = () => api.get("/employees");
export const getEmployee = (id: string) => api.get(`/employees/${id}`);
export const updateEmployee = (id: string, data: unknown) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id: string) => api.delete(`/employees/${id}`);