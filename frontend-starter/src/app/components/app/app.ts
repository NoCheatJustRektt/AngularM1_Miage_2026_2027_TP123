import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router); 

  constructor() {
    if (this.auth.token()) {
      this.auth.profile().subscribe({
        next: (profile) => {
          console.log('Profile loaded:', profile);
        },
        error: (err) => {
          console.error('Failed to load profile:', err);
        }
      });
    }
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
