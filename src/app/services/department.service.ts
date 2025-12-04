import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Department, 
  DepartmentListResponse, 
  DepartmentResponse, 
  DepartmentFilters 
} from '../models/department.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.baseUrl = this.apiService.getApiUrl();
  }

  // Get all departments
  getDepartments(page: number = 1, limit: number = 10, filters?: DepartmentFilters): Observable<DepartmentListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof DepartmentFilters];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<DepartmentListResponse>(`${this.baseUrl}/departments`, { params });
  }

  // Get department by ID
  getDepartmentById(id: string): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.baseUrl}/departments/${id}`);
  }

  // Create department
  createDepartment(department: Department): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(`${this.baseUrl}/departments`, department);
  }

  // Update department
  updateDepartment(id: string, department: Department): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.baseUrl}/departments/${id}`, department);
  }

  // Delete department
  deleteDepartment(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/departments/${id}`);
  }

  // Get department statistics
  getDepartmentStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/departments/stats`);
  }

  // Search departments
  searchDepartments(filters: DepartmentFilters): Observable<DepartmentListResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof DepartmentFilters];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<DepartmentListResponse>(`${this.baseUrl}/departments/search`, { params });
  }
}