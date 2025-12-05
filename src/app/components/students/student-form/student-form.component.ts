import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student.service';
import { ClassService } from '../../../services/class.service';
import { DepartmentService } from '../../../services/department.service';
import { CourseService } from '../../../services/course.service';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isEditMode = false;
  studentId: string = '';
  loading = false;
  submitting = false;

  classes: any[] = [];
  departments: any[] = [];
  courses: any[] = [];
  selectedCourses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private classService: ClassService,
    private departmentService: DepartmentService,
    private courseService: CourseService
  ) {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadDepartments();
    this.loadCourses();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.studentId = params['id'];
        this.loadStudentData();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      rollNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      class: ['', [Validators.required]],
      department: ['', [Validators.required]],
      academicYear: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      status: ['Active', [Validators.required]],
      courses: [[]],
      
      // Address
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        zipCode: ['', [Validators.required]],
        country: ['India']
      }),
      
      // Guardian Info
      guardianInfo: this.fb.group({
        name: ['', [Validators.required]],
        relationship: ['', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
        email: ['', [Validators.email]]
      })
    });
  }

  loadStudentData(): void {
    this.loading = true;
    this.studentService.getStudentById(this.studentId).subscribe({
      next: (response) => {
        const student = response.data;
        
        // Format date for input
        const dob = new Date(student.dateOfBirth);
        const formattedDob = dob.toISOString().split('T')[0];
        
        // Populate form
        this.studentForm.patchValue({
          ...student,
          dateOfBirth: formattedDob,
          class: student.class?._id,
          department: student.department?._id,
          courses: student.courses?.map(c => c._id) || []
        });
        
        this.selectedCourses = student.courses || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.loading = false;
        alert('Failed to load student data');
        this.router.navigate(['/students']);
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

  loadCourses(): void {
    this.courseService.getCourses(1, 100).subscribe({
      next: (response) => {
        this.courses = response.data;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  toggleCourseSelection(course: any): void {
    const index = this.selectedCourses.findIndex(c => c._id === course._id);
    if (index > -1) {
      this.selectedCourses.splice(index, 1);
    } else {
      this.selectedCourses.push(course);
    }
    
    // Update form value
    this.studentForm.patchValue({
      courses: this.selectedCourses.map(c => c._id)
    });
  }

  isCourseSelected(course: any): boolean {
    return this.selectedCourses.some(c => c._id === course._id);
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.markFormGroupTouched(this.studentForm);
      return;
    }

    this.submitting = true;
    const formData = this.studentForm.value;

    if (this.isEditMode) {
      this.studentService.updateStudent(this.studentId, formData).subscribe({
        next: () => {
          alert('Student updated successfully!');
          this.router.navigate(['/students', this.studentId]);
        },
        error: (error) => {
          console.error('Error updating student:', error);
          alert('Failed to update student');
          this.submitting = false;
        }
      });
    } else {
      this.studentService.createStudent(formData).subscribe({
        next: (response) => {
          alert('Student created successfully!');
          this.router.navigate(['/students', response.data._id]);
        },
        error: (error) => {
          console.error('Error creating student:', error);
          alert('Failed to create student');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper method for templates
  calculateAge(dateOfBirth: string | Date): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }
}