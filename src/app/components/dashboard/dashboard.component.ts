import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { ClassService } from '../../services/class.service';
import { DepartmentService } from '../../services/department.service';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalStudents: 0,
    totalClasses: 0,
    totalDepartments: 0,
    totalCourses: 0,
    activeStudents: 0,
    activeClasses: 0
  };

  recentStudents: any[] = [];
  recentClasses: any[] = [];
  
  loading = true;

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private departmentService: DepartmentService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load all statistics in parallel
    Promise.all([
      firstValueFrom(this.studentService.getStudentStats()),
      firstValueFrom(this.classService.getClassStats()),
      firstValueFrom(this.departmentService.getDepartmentStats()),
      firstValueFrom(this.courseService.getCourseStats()),
      firstValueFrom(this.studentService.getStudents(1, 5)),
      firstValueFrom(this.classService.getClasses(1, 5))
    ]).then(([studentStats, classStats, deptStats, courseStats, students, classes]) => {
      // Update stats
      this.stats.totalStudents = studentStats?.overview?.totalStudents || 0;
      this.stats.activeStudents = studentStats?.overview?.activeStudents || 0;
      
      this.stats.totalClasses = classStats?.overview?.totalClasses || 0;
      this.stats.activeClasses = classStats?.overview?.activeClasses || 0;
      
      this.stats.totalDepartments = deptStats?.overview?.totalDepartments || 0;
      this.stats.totalCourses = courseStats?.overview?.totalCourses || 0;
      
      // Update recent data
      this.recentStudents = students?.data || [];
      this.recentClasses = classes?.data || [];
      
      this.loading = false;
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    });
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
}