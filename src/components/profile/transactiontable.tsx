// TODO: Replace mock data with real API call using SWR when transactions endpoint is ready

const transactions = [
    { id: "21239172AKS231", customer: "Deni Setiawan", type: "Delivery", total: "Rp. 220,000.00", status: "Complited" },
    { id: "21239172AKS232", customer: "Nemaanestina", type: "Take Away", total: "Rp. 200,000.00", status: "Complited" },
    { id: "21239172AKS233", customer: "Dina Septiani", type: "Dine In", total: "Rp. 119,000.00", status: "Complited" },
    { id: "21239172AKS234", customer: "Relastini", type: "Dine In", total: "Rp. 98,000.00", status: "Complited" },
    { id: "21239172AKS234", customer: "Vikeski", type: "Dine In", total: "Rp. 88,000.00", status: "Declned" },
    { id: "21239172AKS234", customer: "Puree Adi", type: "Dine In", total: "Rp. 67,000.00", status: "Complited" },
];

export default function TransactionTable() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
                        <option>All Transaction</option>
                    </select>
                    <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
                        <option>All Category</option>
                    </select>
                </div>
                <input
                    placeholder="Cari Transaksi..."
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none w-44 text-gray-600"
                />
            </div>

            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Recent Transaction</h3>
                <button className="text-xs text-blue-500 hover:underline">View all</button>
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        {["Id Transaksi", "Customer", "Type Services", "Total Belanja", "Status", "Action"].map((h) => (
                            <th key={h} className="text-left text-xs text-gray-400 font-medium py-2 pr-4">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="py-3 text-xs text-gray-600 pr-4">{row.id}</td>
                            <td className="py-3 text-xs text-gray-800 pr-4">{row.customer}</td>
                            <td className="py-3 text-xs text-gray-600 pr-4">{row.type}</td>
                            <td className="py-3 text-xs text-gray-800 pr-4">{row.total}</td>
                            <td className="py-3 pr-4">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.status === "Complited" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                    }`}>{row.status}</span>
                            </td>
                            <td className="py-3">
                                <button className="text-xs text-blue-500 hover:underline">View Receipt</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}