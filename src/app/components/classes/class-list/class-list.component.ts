import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClassService } from '../../../services/class.service';
import { DepartmentService } from '../../../services/department.service';
import { Class, ClassFilters } from '../../../models/class.model';

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.css']
})
export class ClassListComponent implements OnInit {
  Math = Math; // Expose Math object to template
  classes: Class[] = [];
  filteredClasses: Class[] = [];
  departments: any[] = [];
  
  filters: ClassFilters = {
    page: 1,
    limit: 10,
    sortBy: 'className',
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
  selectedStatus = '';
  selectedYear = '';

  constructor(
    private classService: ClassService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    
    const filters: ClassFilters = {
      page: this.pagination.currentPage,
      limit: this.pagination.itemsPerPage,
      department: this.selectedDepartment,
      status: this.selectedStatus,
      academicYear: this.selectedYear
    };
    
    this.classService.getClasses(filters.page, filters.limit, filters).subscribe({
      next: (response) => {
        this.classes = response.data;
        this.filteredClasses = [...this.classes];
        
        // Add virtual fields
        this.filteredClasses = this.filteredClasses.map(cls => ({
          ...cls,
          classCode: `${cls.className}-${cls.section}`,
          availableSeats: cls.capacity - cls.currentStrength,
          isFull: cls.currentStrength >= cls.capacity
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
        console.error('Error loading classes:', error);
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
    this.loadClasses();
  }

  onClearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.selectedYear = '';
    this.pagination.currentPage = 1;
    this.loadClasses();
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadClasses();
  }

  onDeleteClass(id: string): void {
    if (confirm('Are you sure you want to delete this class? All students in this class will need to be reassigned.')) {
      this.classService.deleteClass(id).subscribe({
        next: () => {
          this.loadClasses();
        },
        error: (error) => {
          console.error('Error deleting class:', error);
          alert('Failed to delete class');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getSeatsBadgeClass(cls: Class): string {
    if (cls.currentStrength >= cls.capacity) {
      return 'badge-danger';
    } else if (cls.currentStrength >= cls.capacity * 0.8) {
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