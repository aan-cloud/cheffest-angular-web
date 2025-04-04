import { HttpHeaders } from '@angular/common/http';
import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { GlobalStateService } from '../../service/global-state.service';
import { Observable } from 'rxjs';
import type { UserData } from '../../service/global-state.service';

type Cart = {
  totalPrice: number,
  cart: {
    id: string | undefined,
    items: Item[]
  },
  items:Item[]
}

type Item = {
  id: string,
  quantity: string,
  food: {
    id: string,
    name: string,
    slug: string,
    description: string,
    price: string,
    imageUrl: string
  }
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  providers: [CookieService],
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cart = signal<Cart | null>(null);
  userId: string | null = null;
  errorDetails: any;
  private cookieService = inject(CookieService);
  user$!: Observable<UserData | null>;

  constructor(private http: HttpClient, private globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    this.user$ = this.globalStateService.state$;

    this.user$.subscribe(user => {
      console.log("User state in CartComponent:", user);
      if (user) {
        this.userId = user.userData.id;
      }
    });

    this.fetchCart();
  }

  fetchCart() {
    const url = `https://cheffest-backend-spring-production.up.railway.app/api/cart/user/${this.userId}`;
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.get<Cart>(url, { headers }).subscribe({
      next: (data) => {
        console.log(`Data cart: ${data}`)
        this.cart.set(data);
      },
      error: (err) => {
        console.log(err)
        this.errorDetails = err.message
      }
    })
  };

  removeFoodFromCart(cartId: string | undefined, foodId: string) {
    const url = `https://cheffest-backend-spring-production.up.railway.app/api/cart/delete/${cartId}/${foodId}`;
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(url, { headers }).subscribe({
      next: (data) => {
        console.log(`Deleted item: ${data}`)
      },
      error: (err) => {
        console.log(err)
      }
    }) 
  }
}
