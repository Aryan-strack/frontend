export interface HeadOfDepartment {
  name: string;
  email: string;
  phone: string;
  qualification?: string;
}

export interface Department {
  _id?: string;
  departmentName: string;
  departmentCode: string;
  headOfDepartment: HeadOfDepartment;
  contactEmail: string;
  contactPhone: string;
  establishmentYear: number;
  description?: string;
  totalFaculty: number;
  totalStudents: number;
  location?: {
    building: string;
    floor: string;
    room: string;
  };
  facilities?: string[];
  status: 'Active' | 'Inactive' | 'Under Maintenance';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Virtual fields (computed on frontend)
  age?: number;
}

export interface DepartmentListResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: Department[];
}

export interface DepartmentResponse {
  success: boolean;
  data: Department;
  message?: string;
}

export interface DepartmentFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}