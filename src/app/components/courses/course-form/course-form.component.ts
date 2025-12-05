import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../services/course.service';
import { DepartmentService } from '../../../services/department.service';
import { Course } from '../../../models/course.model';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css']
})
export class CourseFormComponent implements OnInit {
  courseForm: FormGroup;
  isEditMode = false;
  courseId: string = '';
  loading = false;
  submitting = false;

  departments: any[] = [];
  courses: any[] = []; // For prerequisites
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  semesters = ['Fall', 'Spring', 'Summer', 'Winter'];
  years = [1, 2, 3, 4];
  courseTypes = ['Core', 'Elective', 'Lab', 'Project', 'Thesis'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private departmentService: DepartmentService
  ) {
    this.courseForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadCourses();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.courseId = params['id'];
        this.loadCourseData();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      courseName: ['', [Validators.required]],
      courseCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,4}\d{3,4}$/)]],
      creditHours: ['', [Validators.required, Validators.min(1), Validators.max(6)]],
      description: ['', [Validators.maxLength(1000)]],
      department: ['', [Validators.required]],
      semester: ['', [Validators.required]],
      year: ['', [Validators.required]],
      maxStudents: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      enrolledStudents: [0, [Validators.min(0)]],
      courseType: ['Core', [Validators.required]],
      status: ['Active', [Validators.required]],
      
      // Instructor
      instructor: this.fb.group({
        name: [''],
        email: ['', [Validators.email]],
        phone: ['', [Validators.pattern(/^[0-9]{10,11}$/)]]
      }),
      
      // Schedule
      schedule: this.fb.group({
        days: [[]],
        time: this.fb.group({
          start: [''],
          end: ['']
        }),
        room: ['']
      }),
      
      // Grading Policy
      gradingPolicy: this.fb.group({
        assignments: [0, [Validators.min(0), Validators.max(100)]],
        midterm: [0, [Validators.min(0), Validators.max(100)]],
        final: [0, [Validators.min(0), Validators.max(100)]],
        projects: [0, [Validators.min(0), Validators.max(100)]],
        attendance: [0, [Validators.min(0), Validators.max(100)]]
      }),
      
      // Prerequisites
      prerequisites: [[]],
      
      // Resources
      resources: this.fb.array([])
    });
  }

  get resources(): FormArray {
    return this.courseForm.get('resources') as FormArray;
  }

  addResource(): void {
    this.resources.push(this.fb.group({
      type: ['Syllabus', [Validators.required]],
      title: ['', [Validators.required]],
      url: ['', [Validators.required]],
      uploadedAt: [new Date()]
    }));
  }

  removeResource(index: number): void {
    this.resources.removeAt(index);
  }

  loadCourseData(): void {
    this.loading = true;
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (response) => {
        const course = response.data;
        
        // Clear existing resources
        while (this.resources.length !== 0) {
          this.resources.removeAt(0);
        }
        
        // Add resources from data
        if (course.resources && course.resources.length > 0) {
          course.resources.forEach(resource => {
            this.resources.push(this.fb.group({
              type: [resource.type, [Validators.required]],
              title: [resource.title, [Validators.required]],
              url: [resource.url, [Validators.required]],
              uploadedAt: [resource.uploadedAt]
            }));
          });
        }
        
        this.courseForm.patchValue({
          ...course,
          department: course.department?._id,
          instructor: course.instructor || {},
          schedule: course.schedule || { days: [], time: { start: '', end: '' }, room: '' },
          gradingPolicy: course.gradingPolicy || {},
          prerequisites: course.prerequisites?.map(p => p._id) || []
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.loading = false;
        alert('Failed to load course data');
        this.router.navigate(['/courses']);
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
        this.courses = response.data.filter(course => 
          !this.isEditMode || course._id !== this.courseId
        );
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  toggleDaySelection(day: string): void {
    const daysControl = this.courseForm.get('schedule.days');
    const currentDays = daysControl?.value || [];
    
    if (currentDays.includes(day)) {
      daysControl?.setValue(currentDays.filter((d: string) => d !== day));
    } else {
      daysControl?.setValue([...currentDays, day]);
    }
  }

  isDaySelected(day: string): boolean {
    const currentDays = this.courseForm.get('schedule.days')?.value || [];
    return currentDays.includes(day);
  }

  togglePrerequisite(courseId: string): void {
    const prerequisitesControl = this.courseForm.get('prerequisites');
    const currentPrerequisites = prerequisitesControl?.value || [];
    
    if (currentPrerequisites.includes(courseId)) {
      prerequisitesControl?.setValue(currentPrerequisites.filter((id: string) => id !== courseId));
    } else {
      prerequisitesControl?.setValue([...currentPrerequisites, courseId]);
    }
  }

  isPrerequisiteSelected(courseId: string): boolean {
    const currentPrerequisites = this.courseForm.get('prerequisites')?.value || [];
    return currentPrerequisites.includes(courseId);
  }

  calculateTotalWeight(): number {
    const gradingPolicy = this.courseForm.get('gradingPolicy')?.value || {};
    return Object.values(gradingPolicy).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.markFormGroupTouched(this.courseForm);
      return;
    }

    // Check grading policy total
    const totalWeight = this.calculateTotalWeight();
    if (totalWeight > 0 && totalWeight !== 100) {
      if (!confirm(`Grading policy weights total to ${totalWeight}%. Do you want to continue?`)) {
        return;
      }
    }

    this.submitting = true;
    const formData = this.courseForm.value;

    // Format data
    formData.courseCode = formData.courseCode.toUpperCase();

    if (this.isEditMode) {
      this.courseService.updateCourse(this.courseId, formData).subscribe({
        next: () => {
          alert('Course updated successfully!');
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          console.error('Error updating course:', error);
          alert('Failed to update course');
          this.submitting = false;
        }
      });
    } else {
      this.courseService.createCourse(formData).subscribe({
        next: () => {
          alert('Course created successfully!');
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          console.error('Error creating course:', error);
          alert('Failed to create course');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/courses']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }
}