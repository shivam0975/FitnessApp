import { Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Progress', icon: 'insights', route: '/progress' },
    { label: 'Workouts', icon: 'fitness_center', route: '/workouts' },
    { label: 'Goals', icon: 'flag', route: '/goals' },
    { label: 'Nutrition', icon: 'restaurant', route: '/nutrition' },
    { label: 'Measurements', icon: 'monitor_weight', route: '/measurements' },
    { label: 'Profile', icon: 'person', route: '/profile' },
  ];

  toggleCollapse() {
    this.collapsed.update(v => !v);
  }

  getInitials(): string {
    const user = this.auth.user();
    if (!user) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  }
}

