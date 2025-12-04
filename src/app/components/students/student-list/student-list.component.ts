import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { ClassService } from '../../../services/class.service';
import { DepartmentService } from '../../../services/department.service';
import { Student, SearchFilters } from '../../../models/student.model';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  classes: any[] = [];
  departments: any[] = [];
  
  searchFilters: SearchFilters = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
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
  selectedStatus = '';
  selectedClass = '';
  selectedDepartment = '';

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadClasses();
    this.loadDepartments();
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    
    // Build filters
    const filters: SearchFilters = {
      page: this.pagination.currentPage,
      limit: this.pagination.itemsPerPage
    };
    
    if (this.searchTerm) filters.name = this.searchTerm;
    if (this.selectedStatus) filters.status = this.selectedStatus;
    if (this.selectedClass) filters.class = this.selectedClass;
    if (this.selectedDepartment) filters.department = this.selectedDepartment;
    
    this.studentService.searchStudents(filters).subscribe({
      next: (response) => {
        this.students = response.data;
        this.filteredStudents = [...this.students];
        
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
        console.error('Error loading students:', error);
        this.loading = false;
      }
    });
  }

  loadClasses(): void {
    this.classService.getClasses(1, 100).subscribe({
      next: (response) => {
        this.classes = response.data;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
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
    this.loadStudents();
  }

  onClearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedClass = '';
    this.selectedDepartment = '';
    this.pagination.currentPage = 1;
    this.loadStudents();
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadStudents();
  }

  onDeleteStudent(id: string): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.loadStudents();
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          alert('Failed to delete student');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'graduated': return 'badge-info';
      case 'suspended': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  exportStudents(): void {
    this.studentService.exportStudents('csv').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting students:', error);
        alert('Failed to export students');
      }
    });
  }
}