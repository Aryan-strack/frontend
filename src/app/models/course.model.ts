export interface Instructor {
  name: string;
  email?: string;
  phone?: string;
}

export interface CourseSchedule {
  days: string[];
  time: {
    start: string;
    end: string;
  };
  room: string;
}

export interface GradingPolicy {
  assignments?: number;
  midterm?: number;
  final?: number;
  projects?: number;
  attendance?: number;
}

export interface CourseResource {
  type: 'Syllabus' | 'Notes' | 'Assignment' | 'Reference' | 'Video';
  title: string;
  url: string;
  uploadedAt: Date | string;
}

export interface Course {
  _id?: string;
  courseName: string;
  courseCode: string;
  creditHours: number;
  description?: string;
  department: any; // Department reference or object
  instructor?: Instructor;
  prerequisites: any[]; // Array of Course references or objects
  semester: 'Fall' | 'Spring' | 'Summer' | 'Winter';
  year: number;
  schedule?: CourseSchedule;
  maxStudents: number;
  enrolledStudents: number;
  courseType: 'Core' | 'Elective' | 'Lab' | 'Project' | 'Thesis';
  gradingPolicy?: GradingPolicy;
  resources?: CourseResource[];
  status: 'Active' | 'Inactive' | 'Completed' | 'Cancelled';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  
  // Virtual fields (computed on frontend)
  availableSeats?: number;
  isFull?: boolean;
  enrollmentRate?: number;
}

export interface CourseListResponse {
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
  data: Course[];
}

export interface CourseResponse {
  success: boolean;
  data: Course;
  message?: string;
}

export interface CourseFilters {
  department?: string;
  semester?: string;
  year?: number;
  courseType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}