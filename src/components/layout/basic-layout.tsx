import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex gap-2">
      <div className="bg-black w-20 min-h-screen text-white">
        comes from layout
      </div>
      <Outlet />
    </div>
  );
};

export default RootLayout;
