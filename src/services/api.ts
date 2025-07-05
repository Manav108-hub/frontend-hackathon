import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  User,
  Product,
  Order,
  InventoryUpdate,
  DeliveryStatus,
  SalesData,
  AIAnalyticsResult,
  DashboardStats,
  SalesForecast
} from '@/types';

class ApiService {
  private readonly api: AxiosInstance;
  private readonly maxRetryAttempts = 3;
  private retryCount = 0;

  public readonly aiAnalytics = {
    getComprehensiveAnalytics: (): Promise<ApiResponse<AIAnalyticsResult>> =>
      this.handleRequest<AIAnalyticsResult>(this.api.get('/analytics/ai')),

    analyzeSalesQuantity: (days: number = 30): Promise<ApiResponse<SalesForecast>> =>
      this.handleRequest<SalesForecast>(this.api.get(`/analytics/sales/forecast?days=${days}`)),

    analyzeShelfImage: (imageFile: File): Promise<ApiResponse<any>> => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return this.handleRequest<any>(
        this.api.post('/analytics/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000  // Longer timeout for image uploads
        })
      );
    }
  };

  constructor() {
  this.api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000, // Increase to 30 seconds
    withCredentials: true,
  });
  this.setupInterceptors();
}

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config;
        
        // Handle rate limiting (429)
        if (error.response?.status === 429 && this.retryCount < this.maxRetryAttempts) {
          this.retryCount++;
          
          const retryAfter = error.response.headers['retry-after'] || 5;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          
          return this.api(originalRequest!);
        }
        
        // Reset retry counter on non-429 errors
        this.retryCount = 0;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: AxiosError<ApiResponse<unknown>>): Error {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timed out. Please try again later.');
    }
    
    // Handle network errors
    if (!error.response) {
      return new Error('Network error. Please check your connection.');
    }
    
    // Handle server errors with response data
    if (error.response.data) {
      const responseData = error.response.data;
      return new Error(
        (responseData as { error?: { message?: string } })?.error?.message ||
        (responseData as { error?: string })?.error ||
        (responseData as { message?: string })?.message ||
        `Server error: ${error.response.status}`
      );
    }
    
    // Fallback to generic error
    return new Error(error.message || 'An unexpected error occurred');
  }


  // Auth methods
  public async register(
    email: string,
    name: string,
    password: string,
    key?: string
  ): Promise<ApiResponse<User>> {
    return this.handleRequest<User>(
      this.api.post('/register', { email, name, password, key })
    );
  }

  public async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string }>> {
    return this.handleRequest<{ token: string }>(
      this.api.post('/login', { email, password })
    );
  }

  // Product methods
  public async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.handleRequest<Product[]>(this.api.get('/product'));
  }

  public async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.handleRequest<Product>(
      this.api.get(`/product/${productId}`)
    );
  }

  public async createProduct(
    product: Omit<Product, 'id'>
  ): Promise<ApiResponse<Product>> {
    return this.handleRequest<Product>(
      this.api.post('/product', product)
    );
  }

  // Order methods
  public async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.handleRequest<Order[]>(this.api.get('/orders'));
  }

  public async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    return this.handleRequest<Order>(
      this.api.get(`/orders/${orderId}`)
    );
  }

  public async createOrder(
    order: Omit<Order, 'id' | 'customer_id' | 'created_at'>
  ): Promise<ApiResponse<Order>> {
    return this.handleRequest<Order>(
      this.api.post('/orders', order)
    );
  }

  // Inventory methods
  public async getInventory(): Promise<ApiResponse<InventoryUpdate[]>> {
    return this.handleRequest<InventoryUpdate[]>(
      this.api.get('/inventory')
    );
  }

  // Delivery methods
  public async getDeliveries(): Promise<ApiResponse<DeliveryStatus[]>> {
    return this.handleRequest<DeliveryStatus[]>(
      this.api.get('/delivery')
    );
  }

  public async getDelivery(orderId: string): Promise<ApiResponse<DeliveryStatus>> {
    return this.handleRequest<DeliveryStatus>(
      this.api.get(`/delivery/${orderId}`)
    );
  }

  // Analytics methods
  public async getSalesAnalytics(days: number = 7): Promise<ApiResponse<SalesData[]>> {
    return this.handleRequest<SalesData[]>(
      this.api.get(`/analytics/sales?days=${days}`)
    );
  }

  // AI Analytics methods
  public async getAIAnalytics(): Promise<ApiResponse<AIAnalyticsResult>> {
    return this.handleRequest<AIAnalyticsResult>(
      this.api.get('/analytics/ai')
    );
  }

  public async getSalesForecast(): Promise<ApiResponse<SalesForecast>> {
    return this.handleRequest<SalesForecast>(
      this.api.get('/analytics/sales/forecast')
    );
  }

  public async analyzeShelfImage(imageFile: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.handleRequest<any>(
      this.api.post('/analytics/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
  }

  // Dashboard methods
  public async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.handleRequest<DashboardStats>(
      this.api.get('/admin/dashboard')
    );
  }

  // Simulation methods
  public async startSimulation(): Promise<ApiResponse<{ message: string }>> {
    return this.handleRequest<{ message: string }>(
      this.api.post('/simulation/start')
    );
  }

  public async seedData(): Promise<ApiResponse<{ message: string }>> {
    return this.handleRequest<{ message: string }>(
      this.api.post('/simulation/seed')
    );
  }

  // Health check
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Generic request handler with proper typing
  private async handleRequest<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<ApiResponse<T>> {
    try {
      const response = await promise;
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            data: error.response.data
          });
        } else if (error.request) {
          console.error('API Request Error:', error.request);
        }
      } else {
        console.error('Non-Axios Error:', error);
      }
      
      throw error;
    }
  }
}

export const apiService = new ApiService();
