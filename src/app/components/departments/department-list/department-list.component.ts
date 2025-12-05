import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DepartmentService } from '../../../services/department.service';
import { Department, DepartmentFilters } from '../../../models/department.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {
  Math = Math; // Expose Math object to template
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  
  filters: DepartmentFilters = {
    page: 1,
    limit: 10,
    sortBy: 'departmentName',
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
  selectedStatus = '';

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    
    const filters: DepartmentFilters = {
      page: this.pagination.currentPage,
      limit: this.pagination.itemsPerPage,
      status: this.selectedStatus,
      search: this.searchTerm || undefined
    };
    
    this.departmentService.getDepartments(filters.page, filters.limit, filters).subscribe({
      next: (response) => {
        this.departments = response.data;
        this.filteredDepartments = [...this.departments];
        
        // Add virtual fields
        this.filteredDepartments = this.filteredDepartments.map(dept => ({
          ...dept,
          age: new Date().getFullYear() - dept.establishmentYear
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
        console.error('Error loading departments:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pagination.currentPage = 1;
    this.loadDepartments();
  }

  onClearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.pagination.currentPage = 1;
    this.loadDepartments();
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
    this.loadDepartments();
  }

  onDeleteDepartment(id: string): void {
    if (confirm('Are you sure you want to delete this department? This will affect all related classes and courses.')) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          alert('Failed to delete department');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'under maintenance': return 'badge-info';
      default: return 'badge-secondary';
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

  calculateUtilization(dept: Department): number {
    if (dept.totalFaculty === 0) return 0;
    return Math.round((dept.totalStudents / dept.totalFaculty) * 100) / 100;
  }
}