// types/index.ts - Fixed version without any types

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

// ========== SALES AND INVENTORY TYPES ==========
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
  estimated_arrival?: string;
}

// ========== AI ANALYTICS TYPES ==========
export interface SalesQuantityPrediction {
  prediction: number;
  confidence: number;
  factors: string[];
}

export interface StockLevelsPrediction {
  prediction: number;
  status: 'optimal' | 'low' | 'critical';
  recommendation: string;
}

export interface StockoutRiskPrediction {
  probability: number;
  timeline: string;
  preventionActions: string[];
}

export interface SalesVolumePrediction {
  prediction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactors: string[];
}

export interface ModelAccuracy {
  salesModel: number;
  inventoryModel: number;
  overallAccuracy: number;
}

export interface DetectedProduct {
  name: string;
  confidence: number;
  quantity: number;
}

export interface ImageAnalysisResult {
  detectedProducts?: DetectedProduct[];
  shelfOccupancy: number;
  visualQualityScore: number;
}

export interface PredictionRecord {
  id: string;
  type: string;
  product_id?: string;
  created_at: string;
  prediction: SalesQuantityPrediction | StockLevelsPrediction | StockoutRiskPrediction | SalesVolumePrediction;
}

export interface ImageAnalysisRecord {
  id: string;
  result: ImageAnalysisResult;
  created_at: string;
}

export interface AIAnalyticsResult {
  salesQuantity: SalesQuantityPrediction;
  stockLevels: StockLevelsPrediction;
  stockoutRisk: StockoutRiskPrediction;
  salesVolume: SalesVolumePrediction;
  accuracy: ModelAccuracy;
  predictions: PredictionRecord[];
  imageAnalyses: ImageAnalysisRecord[];
  insights: string[];
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface ForecastPoint {
  date: string;
  predictedSales: number;
  confidence: number;
}

export interface SalesForecast {
  salesQuantity: SalesQuantityPrediction;
  salesVolume: SalesVolumePrediction;
  forecast: ForecastPoint[];
  insights: string[];
  accuracy: number;
}