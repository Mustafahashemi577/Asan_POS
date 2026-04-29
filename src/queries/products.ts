import type { Product } from "@/pages/product/components/product-list";
import type { OrderFoodPayload } from "@/types";

const products: Product[] = [
  {
    id: 1,
    name: "Protein Salad",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "Afghan",
  },
  {
    id: 2,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 3,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 4,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 5,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 6,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 7,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 8,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 9,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 10,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 11,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
  {
    id: 250,
    name: "French Vanilla Fantasy",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "food",
  },
];

export const getProducts = () => {
  // const response = await api.get("/products");
  // return response.data;
  return products;
};

export const orderFood = (payload: OrderFoodPayload) => {
  // const response = await api.post("/orders", payload);
  // return response.data;
  return { message: "Order placed successfully!", payload: payload };
};
