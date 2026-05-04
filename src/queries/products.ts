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

export const getProducts = () =>
  api.get("/products").then((r) => {
    const data: any[] = Array.isArray(r.data)
      ? r.data
      : (r.data.data ?? r.data.products ?? []); // ← use r.data.data
    return data.map(
      (p): Product => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        inStock: p.inStock,
        image: p.signedUrls?.[0] ?? "/placeholder.png", // ← was p.images?.[0]?.imageUrlSigned
      }),
    );
  });


// Step 1: upload image to minio, returns attachmentId
export const uploadProductImage = (file: File): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append("image", file);
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

// Step 3: claim the uploaded image to the created product
export const claimProductImage = (
  id: string,
  productId: string,
): Promise<void> =>
  api.post("/products/images/claim", { id, productId }).then((r) => r.data);
export const orderFood = (payload: OrderFoodPayload) => {
  // const response = await api.post("/orders", payload);
  // return response.data;
  return { message: "Order placed successfully!", payload: payload };
};

export const getProductsByCategory = (
  categoryName: string,
): Promise<Product[]> =>
  api.get("/products", { params: { search: categoryName } }).then((r) => {
    const data: any[] = Array.isArray(r.data)
      ? r.data
      : (r.data.data ?? r.data.products ?? []); // same fix as getProducts
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: categoryName,
      image: p.signedUrls?.[0] ?? "/placeholder.png", // same fix as getProducts
    }));
  });
