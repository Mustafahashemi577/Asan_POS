import api from "@/lib/axios";

export const getCategories = async (search?: string) => {
  const res = await api.get("/categories", {
    params: { search },
  });
  return res.data;
};

export const createCategory = async (data: { name: string }) => {
  const res = await api.post("/categories", data);
  return res.data;
};

export const updateCategory = async (id: string, data: { name: string }) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};
