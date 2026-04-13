import type { RouteObject } from "react-router-dom";

export const mainRoutes: RouteObject[] = [
  {
    index: true,
    element: <div>Hello World</div>,
  },
  {
    path: "about",
    element: <div>Hello from about</div>,
  },
];
