export interface DashboardStatValue {
  total: number;
  percentageChange: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  inventoryName: string;
}

export interface DashboardData {
  todaySales: DashboardStatValue;
  todayProfit: DashboardStatValue;
  lowStockProducts: LowStockProduct[];
}
