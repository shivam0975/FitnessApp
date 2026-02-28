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
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <span class="material-icons-round">fitness_center</span>
          </div>
          @if (!collapsed()) {
            <span class="logo-text">FitTrack</span>
          }
        </div>
        <button class="collapse-btn" (click)="toggleCollapse()">
          <span class="material-icons-round">{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a class="nav-item" [routerLink]="item.route" routerLinkActive="active">
            <span class="material-icons-round nav-icon">{{ item.icon }}</span>
            @if (!collapsed()) {
              <span class="nav-label">{{ item.label }}</span>
            }
            @if (!collapsed()) {
              <div class="nav-active-indicator"></div>
            }
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" [class.collapsed]="collapsed()">
          <div class="user-avatar">
            {{ getInitials() }}
          </div>
          @if (!collapsed()) {
            <div class="user-details">
              <span class="user-name">{{ auth.user()?.username }}</span>
              <span class="user-email">{{ auth.user()?.email }}</span>
            </div>
          }
        </div>
        <button class="logout-btn" (click)="auth.logout()" [title]="collapsed() ? 'Logout' : ''">
          <span class="material-icons-round">logout</span>
          @if (!collapsed()) {
            <span>Logout</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      min-height: 100vh;
      background: var(--bg-card);
      border-right: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      overflow: hidden;
    }
    .sidebar.collapsed { width: 72px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border-light);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: var(--gradient-primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(108,99,255,0.4);
      .material-icons-round { font-size: 22px; color: white; }
    }

    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 700;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      white-space: nowrap;
    }

    .collapse-btn {
      background: transparent;
      border: 1px solid var(--border-light);
      border-radius: 8px;
      padding: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      flex-shrink: 0;
      &:hover { background: var(--bg-elevated); color: var(--text-primary); }
      .material-icons-round { font-size: 18px; }
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 12px;
      border-radius: 12px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: var(--transition);
      position: relative;
      cursor: pointer;
      white-space: nowrap;

      .nav-icon { font-size: 22px; flex-shrink: 0; }
      .nav-label { font-size: 14px; font-weight: 500; }
      .nav-active-indicator {
        position: absolute;
        right: 12px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--primary);
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover {
        background: rgba(108,99,255,0.08);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(108,99,255,0.15);
        color: var(--primary-light);
        font-weight: 600;
        .nav-active-indicator { opacity: 1; }
      }
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 12px;
      background: var(--bg-elevated);
      overflow: hidden;

      &.collapsed { justify-content: center; }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email {
      font-size: 12px;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px;
      background: rgba(255,77,109,0.08);
      border: 1px solid rgba(255,77,109,0.2);
      border-radius: 10px;
      color: var(--error);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      .material-icons-round { font-size: 20px; }
      &:hover { background: rgba(255,77,109,0.15); }
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);
  collapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Workouts', icon: 'fitness_center', route: '/workouts' },
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
