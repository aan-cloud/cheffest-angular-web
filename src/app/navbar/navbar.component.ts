import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isAuth = false;
  showPopover = false;
  userdata: SocialUser | null = null;

  constructor(private router: Router, private authService: SocialAuthService) {}

  isActive(path: string): { [klass: string]: boolean } {
    return { 'active-class': window.location.pathname === path };
  }

  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      this.userdata = user;
      this.isAuth = !!user; // True jika user ada, false jika tidak
    });
  }

  handleSearch(event: KeyboardEvent): void {
    console.log("Search triggered", (event.target as HTMLInputElement).value);
  }

  togglePopover(): void {
    this.showPopover = !this.showPopover;
  }

  handleLogout(): void {
    this.isAuth = false;
    this.userdata = null;
  }

  handleLogin(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  onLoginError(): void {
    console.error("Login error occurred");
  }
}
