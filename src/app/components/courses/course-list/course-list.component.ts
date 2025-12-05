import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../services/course.service';
import { DepartmentService } from '../../../services/department.service';
import { Course, CourseFilters } from '../../../models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  Math = Math; // Expose Math object to template
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  departments: any[] = [];
  
  filters: CourseFilters = {
    page: 1,
    limit: 10,
    sortBy: 'courseCode',
    sortOrder: 'asc'
  };
  
  pagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  };
  
  loading = false;
  searchTerm = '';
  selectedDepartment = '';
  selectedSemester = '';
  selectedCourseType = '';
  selectedStatus = '';
  selectedYear: number | null = null;

  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    
    const filters: CourseFilters = {
      page: this.pagination.currentPage,
      limit: this.pagination.itemsPerPage,
      department: this.selectedDepartment,
      semester: this.selectedSemester,
      courseType: this.selectedCourseType,
      status: this.selectedStatus,
      year: this.selectedYear || undefined,
      search: this.searchTerm || undefined
    };
    
    this.courseService.getCourses(filters.page, filters.limit, filters).subscribe({
      next: (response) => {
        this.courses = response.data;
        this.filteredCourses = [...this.courses];
        
        // Add virtual fields
        this.filteredCourses = this.filteredCourses.map(course => ({
          ...course,
          availableSeats: course.maxStudents - course.enrolledStudents,
          isFull: course.enrolledStudents >= course.maxStudents,
          enrollmentRate: course.maxStudents > 0 ? 
            (course.enrolledStudents / course.maxStudents) * 100 : 0
        }));
        
        this.pagination = {
          currentPage: response.pagination.page,
          itemsPerPage: response.pagination.limit,
          totalItems: response.total,
          totalPages: response.pagination.totalPages,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage
        };
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getDepartments(1, 100).subscribe({
      next: (response) => {
        this.departments = response.data;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  onSearch(): void {
    this.pagination.currentPage = 1;
    this.loadCourses();
  }

  onClearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedSemester = '';
    this.selectedCourseType = '';
    this.selectedStatus = '';
    this.selectedYear = null;
    this.pagination.currentPage = 1;
    this.loadCourses();
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadCourses();
  }

  onDeleteCourse(id: string): void {
    if (confirm('Are you sure you want to delete this course? This will affect all enrolled students.')) {
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.loadCourses();
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Failed to delete course');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getCourseTypeBadgeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'core': return 'badge-primary';
      case 'elective': return 'badge-info';
      case 'lab': return 'badge-success';
      case 'project': return 'badge-warning';
      case 'thesis': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getSeatsBadgeClass(course: Course): string {
    if (course.enrolledStudents >= course.maxStudents) {
      return 'badge-danger';
    } else if (course.enrolledStudents >= course.maxStudents * 0.8) {
      return 'badge-warning';
    } else {
      return 'badge-success';
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, this.pagination.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.pagination.totalPages, startPage + maxPagesToShow - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}