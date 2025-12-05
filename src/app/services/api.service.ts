import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor() { }

  /**
   * Get the base API URL
   */
  getApiUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get complete endpoint URL
   * @param endpoint The API endpoint
   */
  getEndpoint(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  /**
   * Get student endpoints
   */
  getStudentEndpoints() {
    return {
      getAll: `${this.baseUrl}/students`,
      getById: (id: string) => `${this.baseUrl}/students/${id}`,
      create: `${this.baseUrl}/students`,
      update: (id: string) => `${this.baseUrl}/students/${id}`,
      delete: (id: string) => `${this.baseUrl}/students/${id}`,
      search: `${this.baseUrl}/students/search`,
      stats: `${this.baseUrl}/students/stats`,
      bulk: `${this.baseUrl}/students/bulk`,
      export: `${this.baseUrl}/students/export`
    };
  }

  /**
   * Get class endpoints
   */
  getClassEndpoints() {
    return {
      getAll: `${this.baseUrl}/classes`,
      getById: (id: string) => `${this.baseUrl}/classes/${id}`,
      create: `${this.baseUrl}/classes`,
      update: (id: string) => `${this.baseUrl}/classes/${id}`,
      delete: (id: string) => `${this.baseUrl}/classes/${id}`,
      stats: `${this.baseUrl}/classes/stats`
    };
  }

  /**
   * Get department endpoints
   */
  getDepartmentEndpoints() {
    return {
      getAll: `${this.baseUrl}/departments`,
      getById: (id: string) => `${this.baseUrl}/departments/${id}`,
      create: `${this.baseUrl}/departments`,
      update: (id: string) => `${this.baseUrl}/departments/${id}`,
      delete: (id: string) => `${this.baseUrl}/departments/${id}`,
      stats: `${this.baseUrl}/departments/stats`
    };
  }

  /**
   * Get course endpoints
   */
  getCourseEndpoints() {
    return {
      getAll: `${this.baseUrl}/courses`,
      getById: (id: string) => `${this.baseUrl}/courses/${id}`,
      create: `${this.baseUrl}/courses`,
      update: (id: string) => `${this.baseUrl}/courses/${id}`,
      delete: (id: string) => `${this.baseUrl}/courses/${id}`,
      enroll: (id: string) => `${this.baseUrl}/courses/${id}/enroll`,
      withdraw: (id: string) => `${this.baseUrl}/courses/${id}/withdraw`,
      stats: `${this.baseUrl}/courses/stats`
    };
  }

  /**
   * Build query parameters from filters
   * @param filters Object containing filter parameters
   */
  buildQueryParams(filters: any): string {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Get paginated URL
   * @param endpoint Base endpoint
   * @param page Page number
   * @param limit Items per page
   * @param filters Additional filters
   */
  getPaginatedUrl(endpoint: string, page: number = 1, limit: number = 10, filters?: any): string {
    const baseFilters = {
      page,
      limit,
      ...filters
    };
    
    const queryString = this.buildQueryParams(baseFilters);
    return `${endpoint}${queryString}`;
  }

  /**
   * Handle API errors
   * @param error The error object
   */
  handleError(error: any): string {
    console.error('API Error:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        return 'Cannot connect to server. Please check your internet connection and ensure the backend is running.';
      } else if (error.status === 400) {
        return error.error?.error || 'Bad request. Please check your input.';
      } else if (error.status === 401) {
        return 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        return 'Forbidden. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        return 'Resource not found.';
      } else if (error.status === 409) {
        return 'Conflict. The resource already exists.';
      } else if (error.status === 500) {
        return 'Server error. Please try again later.';
      } else {
        return `Error ${error.status}: ${error.message}`;
      }
    }
  }

  /**
   * Get default headers
   */
  getHeaders(): { [key: string]: string } {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Get headers with authentication
   */
  getAuthHeaders(token?: string): { [key: string]: string } {
    const headers = this.getHeaders();
    
    // Add authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Check if API is reachable
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${environment.apiUrl.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Format date for API
   * @param date Date object or string
   */
  formatDateForApi(date: Date | string): string {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Parse API date
   * @param dateString Date string from API
   */
  parseApiDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Prepare form data for API submission
   * @param data The data to prepare
   */
  prepareFormData(data: any): any {
    const preparedData = { ...data };
    
    // Convert dates to ISO string format
    if (preparedData.dateOfBirth) {
      preparedData.dateOfBirth = this.formatDateForApi(preparedData.dateOfBirth);
    }
    
    if (preparedData.enrollmentDate) {
      preparedData.enrollmentDate = this.formatDateForApi(preparedData.enrollmentDate);
    }
    
    // Remove undefined values
    Object.keys(preparedData).forEach(key => {
      if (preparedData[key] === undefined) {
        delete preparedData[key];
      }
    });
    
    return preparedData;
  }
}