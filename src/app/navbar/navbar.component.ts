import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

type LoginResponse = {
  message: string,
  token: string
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  providers: [CookieService],
  imports: [CommonModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isAuth = signal(false);
  showPopover = signal(false);
  userdata = signal<SocialUser | null>(null);
  private cookieService = inject(CookieService);

  constructor(private toasterService: ToastrService, private router: Router, private authService: SocialAuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      console.log(user.photoUrl)
      
      if (user) {
        const url = "https://cheffest-backend-spring-production.up.railway.app/api/auth/google";
        const payload = { token: user.idToken };
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });

        this.http.post<LoginResponse>(url, payload, { headers }).subscribe({
          next: (data) => {
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + 15);
    
            this.cookieService.set('token', data.token, {expires: expiryDate, path: '/'});
            this.userdata.update(() => (user));
            this.isAuth.set(!!user);
            this.toasterService.success('Login Success!', 'Success', {timeOut: 3000})
          },
          error: (error) => {
            console.log(`fetch login error: ${error}`)
          }
        });
      }
    });
  }


  handleSearch(event: KeyboardEvent): void {
    console.log("Search triggered", (event.target as HTMLInputElement).value);
  }

  togglePopover(): void {
    this.showPopover.set(!this.showPopover());
    console.log(this.showPopover())
  }

  handleLogout(): void {
    this.authService.signOut().then(() => {
      this.cookieService.delete('token');
      this.isAuth.set(false);
      this.userdata.set(null);
      this.toasterService.success('Logout Success!', 'Success', {timeOut: 2000})
    });
  }

  handleLogin(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).catch(error => {
      console.error("Login error:", error);
    });
  }

  onLoginError(): void {
    console.error("Login error occurred");
  }
}
