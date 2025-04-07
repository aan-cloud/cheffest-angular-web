import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { GlobalStateService } from '../service/global-state.service';
import { Observable } from 'rxjs';
import type { UserData } from '../service/global-state.service';

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
  user$!:  Observable<UserData | null>;
  googleProvider = GoogleLoginProvider.PROVIDER_ID;

  constructor(private globalStateService: GlobalStateService ,private toasterService: ToastrService, private router: Router, private authService: SocialAuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.user$ = this.globalStateService.state$;

    this.authService.authState.subscribe((user) => {
      
      if (user) {
        const url = "https://cheffest-backend-spring.onrender.com/api/auth/google";
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
            this.toasterService.success('Login Success!', 'Success', {timeOut: 3000});
            this.setUserGlobalState();
          },
          error: (error) => {
            console.log(`fetch login error: ${error}`)
          }
        });
      }
    });
  }

  setUserGlobalState () {
    const url = "https://cheffest-backend-spring.onrender.com/api/auth/me";
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.get<UserData>(url, { headers }).subscribe({
      next: (data) => {
        this.globalStateService.setUser(data);
        this.toasterService.success('Success set the global state', 'Success', { timeOut: 2000 });
      },
      error: (err) => {
        this.toasterService.error('Error set global state userdata', 'Error', {timeOut: 2000})
      }
    });
  }


  handleSearch(event: KeyboardEvent): void {
    console.log("Search triggered", (event.target as HTMLInputElement).value);
  }

  togglePopover(): void {
    this.showPopover.set(!this.showPopover());
  }

  handleLogout(): void {
    this.authService.signOut().then(() => {
      this.cookieService.delete('token');
      this.isAuth.set(false);
      this.userdata.set(null);
      this.globalStateService.resetUser();
      this.toasterService.success('Logout Success!', 'Success', {timeOut: 2000})
    });
  }

  onLoginError(): void {
    console.error("Login error occurred");
  }
}
