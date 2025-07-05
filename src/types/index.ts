// Add these new interfaces to your existing types/index.ts file

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  stock?: number;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  products: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  shipping_address?: string;
}

// ========== NEW TYPES FOR BACKEND INTEGRATION ==========

export interface SalesData {
  id?: string;
  product_id: string;
  category: string;
  quantity: number;
  price: number;
  date: string;
  store_id: string;
}

export interface InventoryUpdate {
  id?: string;
  product_id: string;
  stock_level: number;
  timestamp: string;
  location: string;
  temperature: number;
}

export interface DeliveryStatus {
  id?: string;
  order_id: string;
  vehicle_lat: number;
  vehicle_lng: number;
  status: 'pending' | 'picked_up' | 'on_the_way' | 'delivered';
  timestamp: string;
  driver_id: string;
  estimated_arrival?: string; // Add this optional field
}

export interface AIAnalyticsResult {
  salesQuantity: any;
  stockLevels: any;
  stockoutRisk: any;
  salesVolume: any;
  accuracy: {
    salesModel?: number;
    inventoryModel?: number;
    overallAccuracy?: number;
  };
  predictions: Array<{
    id: string;
    type: string;
    product_id?: string;
    created_at: string;
    prediction: any;
  }>;
  imageAnalyses: Array<{
    id: string;
    result: {
      detectedProducts?: Array<{
        name: string;
        confidence: number;
        quantity: number;
      }>;
      shelfOccupancy: number;
      visualQualityScore: number;
    };
    created_at: string;
  }>;
  insights: string[];
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface SalesForecast {
  salesQuantity: any;
  salesVolume: any;
  forecast: Array<{
    date: string;
    predictedSales: number;
    confidence: number;
  }>;
  insights: string[];
  accuracy: number;
}
