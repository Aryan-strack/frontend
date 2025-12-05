import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClassService } from '../../../services/class.service';
import { DepartmentService } from '../../../services/department.service';
import { Class } from '../../../models/class.model';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.css']
})
export class ClassFormComponent implements OnInit {
  classForm: FormGroup;
  isEditMode = false;
  classId: string = '';
  loading = false;
  submitting = false;

  departments: any[] = [];
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private departmentService: DepartmentService
  ) {
    this.classForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDepartments();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.classId = params['id'];
        this.loadClassData();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      className: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
      section: ['', [Validators.required, Validators.pattern(/^[A-Z]$/)]],
      academicYear: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{4}$/)]],
      capacity: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      currentStrength: [0, [Validators.min(0)]],
      department: ['', [Validators.required]],
      status: ['Active', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      
      // Class Teacher
      classTeacher: this.fb.group({
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
        roomNumber: ['']
      })
    });
  }

  loadClassData(): void {
    this.loading = true;
    this.classService.getClassById(this.classId).subscribe({
      next: (response) => {
        const classData = response.data;
        
        this.classForm.patchValue({
          ...classData,
          department: classData.department?._id,
          classTeacher: classData.classTeacher || {},
          schedule: classData.schedule || { days: [], time: { start: '', end: '' }, roomNumber: '' }
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading class:', error);
        this.loading = false;
        alert('Failed to load class data');
        this.router.navigate(['/classes']);
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

  toggleDaySelection(day: string): void {
    const daysControl = this.classForm.get('schedule.days');
    const currentDays = daysControl?.value || [];
    
    if (currentDays.includes(day)) {
      daysControl?.setValue(currentDays.filter((d: string) => d !== day));
    } else {
      daysControl?.setValue([...currentDays, day]);
    }
  }

  isDaySelected(day: string): boolean {
    const currentDays = this.classForm.get('schedule.days')?.value || [];
    return currentDays.includes(day);
  }

  onSubmit(): void {
    if (this.classForm.invalid) {
      this.markFormGroupTouched(this.classForm);
      return;
    }

    this.submitting = true;
    const formData = this.classForm.value;

    // Format data
    formData.className = formData.className.toUpperCase();
    formData.section = formData.section.toUpperCase();

    if (this.isEditMode) {
      this.classService.updateClass(this.classId, formData).subscribe({
        next: () => {
          alert('Class updated successfully!');
          this.router.navigate(['/classes']);
        },
        error: (error) => {
          console.error('Error updating class:', error);
          alert('Failed to update class');
          this.submitting = false;
        }
      });
    } else {
      this.classService.createClass(formData).subscribe({
        next: () => {
          alert('Class created successfully!');
          this.router.navigate(['/classes']);
        },
        error: (error) => {
          console.error('Error creating class:', error);
          alert('Failed to create class');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/classes']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}