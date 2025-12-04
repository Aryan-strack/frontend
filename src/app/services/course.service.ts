import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Course, 
  CourseListResponse, 
  CourseResponse, 
  CourseFilters 
} from '../models/course.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.baseUrl = this.apiService.getApiUrl();
  }

  // Get all courses
  getCourses(page: number = 1, limit: number = 10, filters?: CourseFilters): Observable<CourseListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof CourseFilters];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<CourseListResponse>(`${this.baseUrl}/courses`, { params });
  }

  // Get course by ID
  getCourseById(id: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.baseUrl}/courses/${id}`);
  }

  // Create course
  createCourse(course: Course): Observable<CourseResponse> {
    return this.http.post<CourseResponse>(`${this.baseUrl}/courses`, course);
  }

  // Update course
  updateCourse(id: string, course: Course): Observable<CourseResponse> {
    return this.http.put<CourseResponse>(`${this.baseUrl}/courses/${id}`, course);
  }

  // Delete course
  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/courses/${id}`);
  }

  // Enroll student in course
  enrollStudent(courseId: string, studentId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/courses/${courseId}/enroll`, { studentId });
  }

  // Withdraw student from course
  withdrawStudent(courseId: string, studentId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/courses/${courseId}/withdraw`, { studentId });
  }

  // Get course statistics
  getCourseStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/courses/stats`);
  }

  // Search courses
  searchCourses(filters: CourseFilters): Observable<CourseListResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof CourseFilters];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<CourseListResponse>(`${this.baseUrl}/courses/search`, { params });
  }
}