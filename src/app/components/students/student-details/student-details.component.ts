import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../services/student.service';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {
  student: Student | null = null;
  loading = false;
  activeTab = 'personal';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadStudent(id);
      }
    });
  }

  loadStudent(id: string): void {
    this.loading = true;
    this.studentService.getStudentById(id).subscribe({
      next: (response) => {
        this.student = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.loading = false;
        alert('Failed to load student details');
        this.router.navigate(['/students']);
      }
    });
  }

  calculateAge(dateOfBirth: Date | string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'graduated': return 'badge-info';
      case 'suspended': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(this.student!._id!).subscribe({
        next: () => {
          alert('Student deleted successfully');
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          alert('Failed to delete student');
        }
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}