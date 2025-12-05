import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Student, 
  StudentListResponse, 
  StudentResponse, 
  SearchFilters,
  StudentStats,
  BulkCreateResponse,
  Address
} from '../models/student.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.baseUrl = this.apiService.getApiUrl();
  }

  /**
   * Get all students with pagination and filtering
   * @param page Page number
   * @param limit Items per page
   * @param filters Filter criteria
   */
  getStudents(page: number = 1, limit: number = 10, filters?: SearchFilters): Observable<StudentListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof SearchFilters];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<StudentListResponse>(`${this.baseUrl}/students`, { params })
      .pipe(
        map(response => {
          // Process dates and add virtual fields
          response.data = response.data.map(student => this.processStudent(student));
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get student by ID
   * @param id Student ID
   */
  getStudentById(id: string): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.baseUrl}/students/${id}`)
      .pipe(
        map(response => {
          response.data = this.processStudent(response.data);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Create new student
   * @param student Student data
   */
  createStudent(student: Student): Observable<StudentResponse> {
    const preparedData = this.apiService.prepareFormData(student);
    
    return this.http.post<StudentResponse>(`${this.baseUrl}/students`, preparedData)
      .pipe(
        map(response => {
          response.data = this.processStudent(response.data);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Update existing student
   * @param id Student ID
   * @param student Updated student data
   */
  updateStudent(id: string, student: Student): Observable<StudentResponse> {
    const preparedData = this.apiService.prepareFormData(student);
    
    return this.http.put<StudentResponse>(`${this.baseUrl}/students/${id}`, preparedData)
      .pipe(
        map(response => {
          response.data = this.processStudent(response.data);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete student
   * @param id Student ID
   */
  deleteStudent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/students/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Search students with advanced filtering
   * @param filters Search filters
   */
  searchStudents(filters: SearchFilters): Observable<StudentListResponse> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof SearchFilters];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<StudentListResponse>(`${this.baseUrl}/students/search`, { params })
      .pipe(
        map(response => {
          response.data = response.data.map(student => this.processStudent(student));
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get student statistics
   */
  getStudentStats(): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.baseUrl}/students/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Bulk create students
   * @param students Array of student data
   */
  bulkCreateStudents(students: Student[]): Observable<BulkCreateResponse> {
    const preparedStudents = students.map(student => this.apiService.prepareFormData(student));
    
    return this.http.post<BulkCreateResponse>(`${this.baseUrl}/students/bulk`, { 
      students: preparedStudents 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Export students data
   * @param format Export format (csv, json)
   */
  exportStudents(format: string = 'csv'): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': format === 'csv' ? 'text/csv' : 'application/json'
    });

    return this.http.get(`${this.baseUrl}/students/export?format=${format}`, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Process student data (add virtual fields, format dates)
   * @param student Student data from API
   */
  private processStudent(student: Student): Student {
    // Format dates
    if (student.dateOfBirth) {
      student.dateOfBirth = this.apiService.parseApiDate(student.dateOfBirth as string);
    }
    
    if (student.enrollmentDate) {
      student.enrollmentDate = this.apiService.parseApiDate(student.enrollmentDate as string);
    }
    
    if (student.createdAt) {
      student.createdAt = this.apiService.parseApiDate(student.createdAt as string);
    }
    
    if (student.updatedAt) {
      student.updatedAt = this.apiService.parseApiDate(student.updatedAt as string);
    }

    // Add virtual fields
    student.age = this.calculateAge(student.dateOfBirth);
    student.fullAddress = this.getFullAddress(student.address);

    return student;
  }

  /**
   * Calculate age from date of birth
   * @param dateOfBirth Date of birth
   */
  calculateAge(dateOfBirth: Date | string): number {
    if (!dateOfBirth) return 0;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get full address string
   * @param address Address object
   */
  private getFullAddress(address: Address): string {
    if (!address) return '';
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }

  /**
   * Validate student email
   * @param email Email to validate
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validate student phone number
   * @param phone Phone number to validate
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate roll number
   * @param rollNumber Roll number to validate
   */
  validateRollNumber(rollNumber: string): boolean {
    const rollNumberRegex = /^[A-Z0-9]+$/;
    return rollNumberRegex.test(rollNumber);
  }

  /**
   * Get status badge class based on status
   * @param status Student status
   */
  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'graduated': return 'badge-info';
      case 'suspended': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  /**
   * Get gender options
   */
  getGenderOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ];
  }

  /**
   * Get status options
   */
  getStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
      { value: 'Graduated', label: 'Graduated' },
      { value: 'Suspended', label: 'Suspended' }
    ];
  }

  /**
   * Handle API errors
   * @param error Error object
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = this.apiService.handleError(error);
    
    // Log error for debugging
    console.error('Student Service Error:', error);
    
    // Return observable with error message
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Generate sample student data for testing
   */
  generateSampleStudent(): Student {
    const currentYear = new Date().getFullYear();
    
    return {
      name: 'John Doe',
      rollNumber: 'CS2024001',
      email: 'john.doe@student.edu',
      phone: '1234567890',
      dateOfBirth: new Date('2000-01-01'),
      gender: 'Male',
      class: '',
      department: '',
      courses: [],
      enrollmentDate: new Date(),
      status: 'Active',
      academicYear: `${currentYear}-${currentYear + 1}`,
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      guardianInfo: {
        name: 'Robert Doe',
        relationship: 'Father',
        phone: '0987654321',
        email: 'robert.doe@email.com'
      }
    };
  }

  /**
   * Get academic year options
   */
  getAcademicYearOptions(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    
    // Generate options for current and next 5 years
    for (let i = 0; i < 5; i++) {
      years.push(`${currentYear + i}-${currentYear + i + 1}`);
    }
    
    return years;
  }

  /**
   * Download exported file
   * @param blob File blob
   * @param filename File name
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Check if student can be enrolled in course
   * @param studentId Student ID
   * @param courseId Course ID
   */
  canEnrollInCourse(studentId: string, courseId: string): Observable<boolean> {
    // This would check prerequisites, schedule conflicts, etc.
    // For now, return true
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  /**
   * Get students by class
   * @param classId Class ID
   */
  getStudentsByClass(classId: string, page: number = 1, limit: number = 10): Observable<StudentListResponse> {
    const filters: SearchFilters = {
      class: classId,
      page,
      limit
    };
    
    return this.searchStudents(filters);
  }

  /**
   * Get students by department
   * @param departmentId Department ID
   */
  getStudentsByDepartment(departmentId: string, page: number = 1, limit: number = 10): Observable<StudentListResponse> {
    const filters: SearchFilters = {
      department: departmentId,
      page,
      limit
    };
    
    return this.searchStudents(filters);
  }

  /**
   * Upload student photo
   * @param studentId Student ID
   * @param file Photo file
   */
  uploadStudentPhoto(studentId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    
    return this.http.post(`${this.baseUrl}/students/${studentId}/photo`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Upload student document
   * @param studentId Student ID
   * @param file Document file
   * @param documentName Document name
   */
  uploadStudentDocument(studentId: string, file: File, documentName: string): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', documentName);
    
    return this.http.post(`${this.baseUrl}/students/${studentId}/documents`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }
}