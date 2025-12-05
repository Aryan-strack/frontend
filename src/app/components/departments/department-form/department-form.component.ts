import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../../services/department.service';
import { Department } from '../../../models/department.model';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.css']
})
export class DepartmentFormComponent implements OnInit {
  departmentForm: FormGroup;
  isEditMode = false;
  departmentId: string = '';
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService
  ) {
    this.departmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.departmentId = params['id'];
        this.loadDepartmentData();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      departmentName: ['', [Validators.required, Validators.minLength(2)]],
      departmentCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,6}$/)]],
      establishmentYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      status: ['Active', [Validators.required]],
      description: ['', [Validators.maxLength(1000)]],
      totalFaculty: [0, [Validators.min(0)]],
      totalStudents: [0, [Validators.min(0)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      
      // Head of Department
      headOfDepartment: this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
        qualification: ['']
      }),
      
      // Location
      location: this.fb.group({
        building: [''],
        floor: [''],
        room: ['']
      }),
      
      // Facilities
      facilities: this.fb.array([])
    });
  }

  get facilities(): FormArray {
    return this.departmentForm.get('facilities') as FormArray;
  }

  addFacility(facility: string = ''): void {
    this.facilities.push(this.fb.control(facility, [Validators.required]));
  }

  removeFacility(index: number): void {
    this.facilities.removeAt(index);
  }

  loadDepartmentData(): void {
    this.loading = true;
    this.departmentService.getDepartmentById(this.departmentId).subscribe({
      next: (response) => {
        const dept = response.data;
        
        // Clear existing facilities
        while (this.facilities.length !== 0) {
          this.facilities.removeAt(0);
        }
        
        // Add facilities from data
        if (dept.facilities && dept.facilities.length > 0) {
          dept.facilities.forEach(facility => {
            this.addFacility(facility);
          });
        }
        
        this.departmentForm.patchValue({
          ...dept,
          headOfDepartment: dept.headOfDepartment || {},
          location: dept.location || {}
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading department:', error);
        this.loading = false;
        alert('Failed to load department data');
        this.router.navigate(['/departments']);
      }
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.markFormGroupTouched(this.departmentForm);
      return;
    }

    this.submitting = true;
    const formData = this.departmentForm.value;

    // Format data
    formData.departmentCode = formData.departmentCode.toUpperCase();

    if (this.isEditMode) {
      this.departmentService.updateDepartment(this.departmentId, formData).subscribe({
        next: () => {
          alert('Department updated successfully!');
          this.router.navigate(['/departments']);
        },
        error: (error) => {
          console.error('Error updating department:', error);
          alert('Failed to update department');
          this.submitting = false;
        }
      });
    } else {
      this.departmentService.createDepartment(formData).subscribe({
        next: () => {
          alert('Department created successfully!');
          this.router.navigate(['/departments']);
        },
        error: (error) => {
          console.error('Error creating department:', error);
          alert('Failed to create department');
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/departments']);
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

  calculateAge(): number {
    const year = this.departmentForm.get('establishmentYear')?.value;
    if (year) {
      return new Date().getFullYear() - year;
    }
    return 0;
  }
}