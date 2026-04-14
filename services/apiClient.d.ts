export interface ApiClientType {
  baseURL: string;
  timeout: number;
  fetchWithTimeout: (url: string, options?: RequestInit) => Promise<Response>;
  request: (endpoint: string, options?: RequestInit) => Promise<any>;
  get: (endpoint: string, token?: string | null) => Promise<any>;
  post: (endpoint: string, body: any, token?: string | null) => Promise<any>;
  put: (endpoint: string, body: any, token?: string | null) => Promise<any>;
  delete: (endpoint: string, token?: string | null) => Promise<any>;
}

declare const apiClient: ApiClientType;
export default apiClient;
