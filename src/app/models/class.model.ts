export interface Schedule {
  days: string[];
  time: {
    start: string;
    end: string;
  };
  roomNumber: string;
}

export interface Class {
  _id?: string;
  className: string;
  section: string;
  academicYear: string;
  capacity: number;
  currentStrength: number;
  department: any; // Department reference or object
  classTeacher?: {
    name: string;
    email?: string;
    phone?: string;
  };
  schedule?: Schedule;
  description?: string;
  status: 'Active' | 'Inactive' | 'Completed';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Virtual fields (computed on frontend)
  classCode?: string;
  availableSeats?: number;
  isFull?: boolean;
}

export interface ClassListResponse {
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
  data: Class[];
}

export interface ClassResponse {
  success: boolean;
  data: Class;
  message?: string;
}

export interface ClassFilters {
  department?: string;
  status?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}