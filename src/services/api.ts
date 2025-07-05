import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig
} from 'axios';

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

interface ImageAnalysisResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

class ApiService {
  private readonly api: AxiosInstance;
  private readonly maxRetries: number = 3;
  private readonly retryDelays: number[] = [1000, 3000, 5000]; // Exponential backoff
  private readonly requestQueue: Array<() => void> = [];
  private isQueueProcessing: boolean = false;

  public readonly aiAnalytics = {
    getComprehensiveAnalytics: (config?: AxiosRequestConfig):
      Promise<ApiResponse<AIAnalyticsResult>> =>
        this.handleRequest<AIAnalyticsResult>(this.api.get('/analytics/ai', config)),

    analyzeSalesQuantity: (days: number = 30, config?: AxiosRequestConfig):
      Promise<ApiResponse<SalesForecast>> =>
        this.handleRequest<SalesForecast>(
          this.api.get(`/analytics/sales/forecast?days=${days}`, config)
        ),

    analyzeShelfImage: (imageFile: File, config?: AxiosRequestConfig):
      Promise<ApiResponse<ImageAnalysisResult>> => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return this.handleRequest<ImageAnalysisResult>(
          this.api.post('/analytics/image', formData, {
            ...config,
            headers: {
              ...config?.headers,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 60000
          })
        );
      }
  };

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-hackathon-xt2p.onrender.com/api',
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      withCredentials: true
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalConfig = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

        originalConfig._retryCount = originalConfig._retryCount || 0;

        if (this.shouldRetry(error) && originalConfig._retryCount < this.maxRetries) {
          originalConfig._retryCount++;
          const delay = this.retryDelays[originalConfig._retryCount - 1];
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.api(originalConfig);
        }

        return this.handleSpecificErrors(error);
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.response.status === 429 ||
      error.response.status === 408 ||
      error.response.status >= 500
    );
  }

  private handleSpecificErrors(error: AxiosError): Promise<never> {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(this.normalizeError(error as AxiosError<ApiResponse<unknown>>));
  }

  private normalizeError(error: AxiosError<ApiResponse<unknown>>): Error {
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timed out. Please try again later.');
    }

    if (!error.response) {
      return new Error('Network error. Please check your connection.');
    }

    if (error.response.data) {
      const responseData = error.response.data as {
        error?: { message?: string } | string;
        message?: string;
      };
      
      let errorMessage = `Server error: ${error.response.status}`;
      
      if (typeof responseData.error === 'object' && responseData.error?.message) {
        errorMessage = responseData.error.message;
      } else if (typeof responseData.error === 'string') {
        errorMessage = responseData.error;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
      
      return new Error(errorMessage);
    }

    return new Error(error.message || 'An unexpected error occurred');
  }

  private async enqueueRequest<T>(request: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isQueueProcessing || this.requestQueue.length === 0) return;

    this.isQueueProcessing = true;

    try {
      const task = this.requestQueue.shift();
      if (task) await task();
    } finally {
      this.isQueueProcessing = false;
      this.processQueue();
    }
  }

  // ========== AUTH ==========

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

  // ========== PRODUCT ==========

  public async getProducts(config?: AxiosRequestConfig): Promise<ApiResponse<Product[]>> {
    return this.handleRequest<Product[]>(this.api.get('/product', config));
  }

  public async getProduct(productId: string, config?: AxiosRequestConfig): Promise<ApiResponse<Product>> {
    return this.handleRequest<Product>(
      this.api.get(`/product/${productId}`, config)
    );
  }

  public async createProduct(
    product: Omit<Product, 'id'>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<Product>> {
    return this.handleRequest<Product>(
      this.api.post('/product', product, config)
    );
  }

  // ========== ORDER ==========

  public async getOrders(config?: AxiosRequestConfig): Promise<ApiResponse<Order[]>> {
    return this.handleRequest<Order[]>(this.api.get('/orders', config));
  }

  public async getOrder(orderId: string, config?: AxiosRequestConfig): Promise<ApiResponse<Order>> {
    return this.handleRequest<Order>(
      this.api.get(`/orders/${orderId}`, config)
    );
  }

  public async createOrder(
    order: Omit<Order, 'id' | 'customer_id' | 'created_at'>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<Order>> {
    return this.handleRequest<Order>(
      this.api.post('/orders', order, config)
    );
  }

  // ========== INVENTORY ==========

  public async getInventory(config?: AxiosRequestConfig): Promise<ApiResponse<InventoryUpdate[]>> {
    return this.handleRequest<InventoryUpdate[]>(
      this.api.get('/inventory', config)
    );
  }

  // ========== DELIVERY ==========

  public async getDeliveries(config?: AxiosRequestConfig): Promise<ApiResponse<DeliveryStatus[]>> {
    return this.handleRequest<DeliveryStatus[]>(
      this.api.get('/delivery', config)
    );
  }

  public async getDelivery(orderId: string, config?: AxiosRequestConfig): Promise<ApiResponse<DeliveryStatus>> {
    return this.handleRequest<DeliveryStatus>(
      this.api.get(`/delivery/${orderId}`, config)
    );
  }

  // ========== ANALYTICS ==========

  public async getSalesAnalytics(days: number = 7, config?: AxiosRequestConfig): Promise<ApiResponse<SalesData[]>> {
    return this.handleRequest<SalesData[]>(
      this.api.get(`/analytics/sales?days=${days}`, config)
    );
  }

  public async getDashboardStats(config?: AxiosRequestConfig): Promise<ApiResponse<DashboardStats>> {
    return this.handleRequest<DashboardStats>(
      this.api.get('/admin/dashboard', config)
    );
  }

  // ========== SIMULATION ==========

  public async startSimulation(config?: AxiosRequestConfig): Promise<ApiResponse<{ message: string }>> {
    return this.handleRequest<{ message: string }>(
      this.api.post('/simulation/start', {}, config)
    );
  }

  public async seedData(config?: AxiosRequestConfig): Promise<ApiResponse<{ message: string }>> {
    return this.handleRequest<{ message: string }>(
      this.api.post('/simulation/seed', {}, config)
    );
  }

  // ========== HEALTH CHECK ==========

  public async healthCheck(config?: AxiosRequestConfig): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health', config);
    return response.data;
  }

  // ========== HANDLE REQUEST ==========

  private async handleRequest<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<ApiResponse<T>> {
    try {
      const startTime = Date.now();
      const response = await promise;
      const duration = Date.now() - startTime;

      console.debug(`API ${response.config.url} took ${duration}ms`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API Error: ${error.message}`, {
          code: error.code,
          status: error.response?.status,
          url: error.config?.url,
          method: error.config?.method
        });
      } else {
        console.error('Non-Axios Error:', error);
      }

      throw error;
    }
  }
}

export const apiService = new ApiService();
