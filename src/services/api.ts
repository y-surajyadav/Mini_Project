const API_BASE = '/api/v1';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('smart_warehouse_token');
  }

  public static setToken(token: string) {
    localStorage.setItem('smart_warehouse_token', token);
  }

  public static clearToken() {
    localStorage.removeItem('smart_warehouse_token');
    localStorage.removeItem('smart_warehouse_user');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired or invalid
      this.clearToken();
      window.dispatchEvent(new Event('auth_state_changed'));
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Network request failed');
    }

    return data;
  }

  // Auth
  public static async login(credentials: { username: string; password: string }) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  public static async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  public static async getUsers() {
    return this.request<{ success: boolean; users: any[] }>('/auth/users');
  }

  // Products
  public static async getProducts(params?: { search?: string; category?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; total: number; products: any[] }>(`/products?${query}`);
  }

  public static async createProduct(productData: any) {
    return this.request<{ success: boolean; product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  public static async updateProduct(id: string, updates: any) {
    return this.request<{ success: boolean; product: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Suppliers
  public static async getSuppliers() {
    return this.request<{ success: boolean; total: number; suppliers: any[] }>('/suppliers');
  }

  public static async createSupplier(supplierData: any) {
    return this.request<{ success: boolean; supplier: any }>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  }

  // Inventory & Ledger
  public static async getMovements(params?: { productId?: string; movementType?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<{ success: boolean; total: number; movements: any[] }>(`/inventory/movements?${query}`);
  }

  public static async recordMovement(movementData: any) {
    return this.request<{ success: boolean; movement: any; updatedProduct: any }>('/inventory/movements', {
      method: 'POST',
      body: JSON.stringify(movementData)
    });
  }

  public static async getRecommendations() {
    return this.request<{ success: boolean; total: number; recommendations: any[] }>('/inventory/recommendations');
  }

  public static async reviewRecommendation(id: string, data: { reviewStatus: string; managerNotes?: string }) {
    return this.request<{ success: boolean; recommendation: any }>(`/inventory/recommendations/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public static async getAlerts() {
    return this.request<{ success: boolean; total: number; alerts: any[] }>('/inventory/alerts');
  }

  public static async acknowledgeAlert(id: string) {
    return this.request<{ success: boolean; alert: any }>(`/inventory/alerts/${id}/acknowledge`, {
      method: 'PUT'
    });
  }

  // Dataset Management
  public static async getDatasetStatus() {
    return this.request<{ success: boolean; report: any }>('/dataset/status');
  }

  public static async configureDatasetPath(datasetDir: string) {
    return this.request<{ success: boolean; message: string; report: any }>('/dataset/configure-path', {
      method: 'POST',
      body: JSON.stringify({ datasetDir })
    });
  }

  // ML Service & Benchmarks
  public static async getModels() {
    return this.request<{ success: boolean; total: number; models: any[] }>('/ml/models');
  }

  public static async selectProductionModel(modelId: string, rationale: string) {
    return this.request<{ success: boolean; message: string; productionModel: any }>('/ml/select-production', {
      method: 'POST',
      body: JSON.stringify({ modelId, rationale })
    });
  }

  public static async submitTrainingJob(config: { models: string[]; horizon: number; sampleRatio: number }) {
    return this.request<{ success: boolean; job: any }>('/ml/train', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  public static async getForecast(sku: string, horizon: number = 28) {
    return this.request<{ success: boolean; forecast: any }>(`/ml/forecast?sku=${encodeURIComponent(sku)}&horizon=${horizon}`);
  }

  public static async getShapExplanations(sku: string, modelId?: string) {
    const query = modelId ? `?sku=${encodeURIComponent(sku)}&modelId=${encodeURIComponent(modelId)}` : `?sku=${encodeURIComponent(sku)}`;
    return this.request<{ success: boolean; explanation: any }>(`/ml/explain/shap${query}`);
  }

  // Audit Logs
  public static async getAuditLogs(action?: string) {
    const query = action ? `?action=${encodeURIComponent(action)}` : '';
    return this.request<{ success: boolean; total: number; logs: any[] }>(`/audit/logs${query}`);
  }

  // Reports
  public static getExportUrl(reportType: string) {
    const token = this.getToken();
    return `${API_BASE}/reports/export/${reportType}?token=${token || ''}`;
  }
}
