// Cliente HTTP base para toda la aplicación
// Infraestructura compartida para comunicación con APIs

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Configuración base del cliente
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Interceptores para manejo de errores y autenticación
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.defaultHeaders = config.headers;
  }

  // Obtener token de autenticación
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Construir headers con autenticación
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken();
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Método base para requests
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options.headers as Record<string, string>);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Método para simular delay en desarrollo
  async simulateDelay(ms: number = 500): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }
}

// Instancia singleton del cliente
export const apiClient = new ApiClient();

// Para desarrollo: cliente que simula respuestas
export class MockApiClient extends ApiClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Simular delay de red
    await this.simulateDelay(300 + Math.random() * 500);
    
    // Simular respuesta exitosa
    return {
      data: {} as T,
      status: 200,
      success: true,
    };
  }
}

// Exportar cliente según el entorno
export const client = process.env.NODE_ENV === 'development' 
  ? new MockApiClient() 
  : apiClient; 

declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL: string;
      [key: string]: any;
    };
  }
} 