import api from "@/lib/axios";
import type { Product } from "@/pages/product/components/product-list";
import type { OrderFoodPayload } from "@/types";

//const products: Product[] = [
//   {
//     id: 1,
//     name: "Protein Salad",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "Afghan",
//   },
//   {
//     id: 2,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 3,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 4,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 5,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 6,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 7,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 8,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 9,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 10,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 11,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//   {
//     id: 250,
//     name: "French Vanilla Fantasy",
//     price: 250,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//     category: "food",
//   },
//];
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const getProducts = (params?: {
  page?: number;
  itemsPerPage?: number;
  search?: string;
  categoryName?: string;
}): Promise<{ data: Product[]; meta: PaginationMeta }> =>
  api
    .get("/products", {
      params: {
        page: params?.page ?? 1,
        itemsPerPage: params?.itemsPerPage ?? 20,
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.categoryName ? { search: params.categoryName } : {}),
      },
    })
    .then((r) => {
      const raw: any[] = Array.isArray(r.data)
        ? r.data
        : (r.data.data ?? r.data.products ?? []);
      const meta: PaginationMeta = r.data.meta ?? {
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: raw.length,
        totalPages: 1,
      };
      const data = raw.map(
        (p): Product => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          inStock: p.inStock,
          image: p.images?.[0]?.imageUrlSigned ?? "/placeholder.png",
          images:
            p.images
              ?.filter((img: any) => img.imageUrlSigned)
              .map((img: any) => ({ id: img.id, url: img.imageUrlSigned })) ??
            [],
        }),
      );
      return { data, meta };
    });

// Step 1: upload multiple images to minio at once, returns { ids: string[] }
export const uploadProductImages = (
  files: File[],
): Promise<{ ids: string[] }> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return api
    .post("/products/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

// Step 2: create the product, returns { id: string }
export const createProduct = (data: {
  name: string;
  price: number;
  categoryName: string;
  inStock?: boolean;
}): Promise<{ id: string }> => api.post("/products", data).then((r) => r.data);

// Update an existing product by id
export const updateProduct = (
  id: string,
  data: {
    name: string;
    price: number;
    categoryName: string;
    inStock?: boolean;
  },
): Promise<{ message: string }> =>
  api.put(`/products/${id}`, data).then((r) => r.data);

// Delete a product by id
export const deleteProduct = (id: string): Promise<{ message: string }> =>
  api.delete(`/products/${id}`).then((r) => r.data);

// Delete a single product image by imageId
export const deleteProductImage = (
  imageId: string,
): Promise<{ message: string }> =>
  api.delete(`/products/images/${imageId}`).then((r) => r.data);

// Step 3: claim all uploaded images to the product in one request
export const claimProductImages = (
  ids: string[],
  productId: string,
): Promise<void> =>
  api.post("/products/images/claim", { ids, productId }).then((r) => r.data);

export const orderFood = (payload: OrderFoodPayload) => {
  return { message: "Order placed successfully!", payload: payload };
};
