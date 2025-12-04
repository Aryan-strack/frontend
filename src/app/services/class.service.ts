import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Class, 
  ClassListResponse, 
  ClassResponse, 
  ClassFilters 
} from '../models/class.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.baseUrl = this.apiService.getApiUrl();
  }

  // Get all classes
  getClasses(page: number = 1, limit: number = 10, filters?: ClassFilters): Observable<ClassListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ClassFilters];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ClassListResponse>(`${this.baseUrl}/classes`, { params });
  }

  // Get class by ID
  getClassById(id: string): Observable<ClassResponse> {
    return this.http.get<ClassResponse>(`${this.baseUrl}/classes/${id}`);
  }

  // Create class
  createClass(classData: Class): Observable<ClassResponse> {
    return this.http.post<ClassResponse>(`${this.baseUrl}/classes`, classData);
  }

  // Update class
  updateClass(id: string, classData: Class): Observable<ClassResponse> {
    return this.http.put<ClassResponse>(`${this.baseUrl}/classes/${id}`, classData);
  }

  // Delete class
  deleteClass(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/classes/${id}`);
  }

  // Get class statistics
  getClassStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/classes/stats`);
  }

  // Search classes
  searchClasses(filters: ClassFilters): Observable<ClassListResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof ClassFilters];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ClassListResponse>(`${this.baseUrl}/classes/search`, { params });
  }
}