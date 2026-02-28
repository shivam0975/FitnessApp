import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './core/services/auth.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ToastComponent],
  template: `
    <div class="app-shell" [class.with-sidebar]="showSidebar()">
      @if (showSidebar()) {
        <app-sidebar></app-sidebar>
        <main class="main-content" [class.sidebar-open]="showSidebar()">
          <router-outlet></router-outlet>
        </main>
      } @else {
        <router-outlet></router-outlet>
      }
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; }
    .app-shell.with-sidebar { display: flex; }
    .main-content {
      flex: 1;
      margin-left: 260px;
      min-height: 100vh;
      transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
      overflow-x: hidden;
    }
    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
    }
  `]
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).url)
    ),
    { initialValue: this.router.url }
  );

  showSidebar = computed(() => {
    const url = this.currentUrl();
    const isAuth = this.auth.isAuthenticated();
    const isAuthRoute = url.startsWith('/auth');
    return isAuth && !isAuthRoute;
  });
}
