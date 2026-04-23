import { Button } from "../ui/button";

// TODO: Replace mock data with real API call using SWR when transactions endpoint is ready

const transactions = [
  {
    id: "21239172AKS231",
    customer: "Deni Setiawan",
    type: "Delivery",
    total: "Rp. 220,000.00",
    status: "Completed",
  },
  {
    id: "21239172AKS232",
    customer: "Nemaanestina",
    type: "Take Away",
    total: "Rp. 200,000.00",
    status: "Completed",
  },
  {
    id: "21239172AKS233",
    customer: "Dina Septiani",
    type: "Dine In",
    total: "Rp. 119,000.00",
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Relastini",
    type: "Dine In",
    total: "Rp. 98,000.00",
    status: "Completed",
  },
  {
    id: "21239172AKS234",
    customer: "Vikeski",
    type: "Dine In",
    total: "Rp. 88,000.00",
    status: "Declned",
  },
  {
    id: "21239172AKS234",
    customer: "Puree Adi",
    type: "Dine In",
    total: "Rp. 67,000.00",
    status: "Completed",
  },
];

export default function TransactionTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
            <option>All Transaction</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
            <option>All Category</option>
          </select>
        </div>

        <input
          placeholder="Search Transactions"
          className="text-xs border border-gray-200 Totalrounded-lg px-3 py-1.5 outline-none w-full sm:w-44 text-gray-600"
        />
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Recent Transaction
        </h3>
        <Button
          className="text-xs text-blue-500 hover:underline"
          variant="ghost"
        >
          View all
        </Button>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              {["Id", "Customer", "Type", "Total", "Status", "Action"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-xs text-gray-400 py-2 pr-4"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {transactions.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 text-xs text-gray-600">{row.id}</td>
                <td className="py-3 text-xs text-gray-800">{row.customer}</td>
                <td className="py-3 text-xs text-gray-600">{row.type}</td>
                <td className="py-3 text-xs text-gray-800">{row.total}</td>
                <td className="py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      row.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  <Button
                    className=" text-xs text-blue-500 hover:underline"
                    variant="ghost"
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="sm:hidden space-y-3">
        {transactions.map((row, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-xl p-3 shadow-sm"
          >
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">{row.id}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  row.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {row.status}
              </span>
            </div>

            <p className="text-sm font-medium text-gray-800">{row.customer}</p>

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{row.type}</span>
              <span>{row.total}</span>
            </div>

            <Button className="text-xs text-blue-500 mt-2">View Receipt</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
