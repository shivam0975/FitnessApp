import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './core/services/auth.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ToastComponent, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  routeLoading = signal(false);

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

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.routeLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.routeLoading.set(false);
      }
    });
  }
}
