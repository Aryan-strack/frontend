export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface GuardianInfo {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Student {
  _id?: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  address: Address;
  dateOfBirth: Date | string;
  gender: 'Male' | 'Female' | 'Other';
  class: any; // Class reference or object
  department: any; // Department reference or object
  courses: any[]; // Array of Course references or objects
  enrollmentDate?: Date | string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  academicYear: string;
  guardianInfo: GuardianInfo;
  photo?: string;
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: Date | string;
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Virtual fields (computed on frontend)
  fullAddress?: string;
  age?: number;
}

export interface StudentListResponse {
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
  data: Student[];
}

export interface StudentResponse {
  success: boolean;
  data: Student;
  message?: string;
}

export interface SearchFilters {
  name?: string;
  rollNumber?: string;
  email?: string;
  phone?: string;
  class?: string;
  department?: string;
  status?: string;
  gender?: string;
  academicYear?: string;
  city?: string;
  state?: string;
  minAge?: number;
  maxAge?: number;
  enrollmentDateFrom?: string;
  enrollmentDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  q?: string; // General search
}

export interface StudentStats {
  overview: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    graduatedStudents: number;
    suspendedStudents: number;
    maleStudents: number;
    femaleStudents: number;
    otherStudents: number;
    averageAge: number;
  };
  departmentStats: Array<{
    departmentName: string;
    departmentCode: string;
    studentCount: number;
  }>;
  classStats: Array<{
    className: string;
    section: string;
    studentCount: number;
    capacity: number;
    percentageFull: number;
  }>;
}

export interface BulkCreateResponse {
  success: boolean;
  message: string;
  results: {
    successful: number;
    failed: number;
    details: {
      success: Array<{
        id: string;
        name: string;
        rollNumber: string;
      }>;
      errors: Array<{
        student: any;
        error: string;
      }>;
    };
  };
}