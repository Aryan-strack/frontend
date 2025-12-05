import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: 'fas fa-home', route: '/dashboard', active: true },
    { title: 'Students', icon: 'fas fa-users', route: '/students', active: false },
    { title: 'Classes', icon: 'fas fa-chalkboard', route: '/classes', active: false },
    { title: 'Departments', icon: 'fas fa-building', route: '/departments', active: false },
    { title: 'Courses', icon: 'fas fa-book', route: '/courses', active: false },
    // { title: 'Reports', icon: 'fas fa-chart-bar', route: '/reports', active: false },
    // { title: 'Settings', icon: 'fas fa-cog', route: '/settings', active: false },
  ];

  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}