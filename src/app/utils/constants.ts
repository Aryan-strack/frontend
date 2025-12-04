export const Constants = {
  // API Endpoints
  API_URL: 'http://localhost:3000/api',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50, 100],
  
  // Status Options
  STUDENT_STATUSES: ['Active', 'Inactive', 'Graduated', 'Suspended'],
  CLASS_STATUSES: ['Active', 'Inactive', 'Completed'],
  DEPARTMENT_STATUSES: ['Active', 'Inactive', 'Under Maintenance'],
  COURSE_STATUSES: ['Active', 'Inactive', 'Completed', 'Cancelled'],
  
  // Gender Options
  GENDERS: ['Male', 'Female', 'Other'],
  
  // Semester Options
  SEMESTERS: ['Fall', 'Spring', 'Summer', 'Winter'],
  
  // Course Types
  COURSE_TYPES: ['Core', 'Elective', 'Lab', 'Project', 'Thesis'],
  
  // Academic Years (Last 5 years)
  ACADEMIC_YEARS: (() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(`${currentYear - i}-${currentYear - i + 1}`);
    }
    return years;
  })(),
  
  // Years (1-4 for courses)
  YEARS: [1, 2, 3, 4],
  
  // Days of week
  DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  
  // Course Prerequisite Relationships
  PREREQUISITE_TYPES: ['Required', 'Recommended', 'Co-requisite'],
  
  // Validation Patterns
  PATTERNS: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^[0-9]{10,11}$/,
    ROLL_NUMBER: /^[A-Z0-9]+$/,
    CLASS_NAME: /^[A-Z0-9]+$/,
    DEPARTMENT_CODE: /^[A-Z]{2,6}$/,
    COURSE_CODE: /^[A-Z]{2,4}\d{3,4}$/,
    ACADEMIC_YEAR: /^\d{4}-\d{4}$/,
    ZIP_CODE: /^[0-9]{5,6}$/,
  },
  
  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    FILTERS: 'filters_',
    PREFERENCES: 'preferences',
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    REQUIRED: 'This field is required',
    EMAIL: 'Please enter a valid email address',
    PHONE: 'Please enter a valid phone number',
    MIN_LENGTH: (length: number) => `Minimum ${length} characters required`,
    MAX_LENGTH: (length: number) => `Maximum ${length} characters allowed`,
    PATTERN: (field: string) => `Invalid ${field} format`,
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    CREATED: (entity: string) => `${entity} created successfully`,
    UPDATED: (entity: string) => `${entity} updated successfully`,
    DELETED: (entity: string) => `${entity} deleted successfully`,
  },
  
  // UI Constants
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_TIME: 300,
    TOAST_DURATION: 3000,
  },
  
  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    MAX_FILES: 5,
  },
  
  // Export Formats
  EXPORT_FORMATS: ['csv', 'json', 'pdf', 'excel'],
  
  // Chart Colors
  CHART_COLORS: [
    '#4361ee', '#3f37c9', '#4cc9f0', '#f72585', '#7209b7',
    '#3a0ca3', '#f8961e', '#2a9d8f', '#e63946', '#1d3557',
  ],
  
  // Status Colors
  STATUS_COLORS: {
    Active: '#4cc9f0',
    Inactive: '#f8961e',
    Completed: '#2a9d8f',
    Graduated: '#7209b7',
    Suspended: '#e63946',
    Cancelled: '#6c757d',
    'Under Maintenance': '#f8961e',
  },
  
  // Grade Points
  GRADE_POINTS: {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0,
  },
  
  // Attendance Thresholds
  ATTENDANCE_THRESHOLDS: {
    MINIMUM: 75,
    WARNING: 80,
    GOOD: 90,
    EXCELLENT: 95,
  },
  
  // Date Formats
  DATE_FORMATS: {
    DISPLAY: 'dd/MM/yyyy',
    INPUT: 'yyyy-MM-dd',
    TIME: 'HH:mm',
    DATETIME: 'dd/MM/yyyy HH:mm',
  },
};