import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { GlobalStateService, UserData } from '../../service/global-state.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

interface Food {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
}

type FoodToCartResponse = {
  message: string,
  productName: string,
  quantity: number
}

@Component({
  selector: 'app-foods',
  standalone: true,
  providers: [CookieService],
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css'],
  imports: [CommonModule]
})
export class FoodsComponent implements OnInit {
  isLoading = false;
  foods: Food[] = [];
  apiUrl = "https://cheffest-backend-spring.onrender.com";
  cookieService = inject(CookieService);
  private userId: string | null = null;
  user$!:  Observable<UserData | null>;

  constructor(private globalStateService: GlobalStateService, private toasterService: ToastrService ,private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.user$ = this.globalStateService.state$;

    this.user$.subscribe(user => {
      if (user) {
        this.userId = user.userData.id;
      }
    });

    this.route.queryParams.subscribe(params => {
      const searchQuery = params['name'];
      this.fetchFoods(searchQuery);
    });
  }

  fetchFoods(searchQuery?: string): void {
    this.isLoading = true;
    const url = `${this.apiUrl}/api/public/foods${searchQuery ? `?slug=${searchQuery}` : ''}`;
    
    this.http.get<Food[]>(url).subscribe({
      next: (data) => {
        this.foods = data
        this.isLoading = false
      },
      error: (error) => {
        this.isLoading = false
      }
    });
  }

  async addFoodToCart (foodId: string, sum: number = 1) {
    const url = `${this.apiUrl}/api/cart/add`;
    const token = this.cookieService.get('token');

    if (!this.userId) {
      this.toasterService.error('User not logged in', 'Error', { timeOut: 2000 });
      return;
    }

    const payload = {
      userId: this.userId,
      foodId,
      sum
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post<FoodToCartResponse>(url, payload, { headers }).subscribe({
      next: (data) => {
        this.toasterService.success(`Success add ${data.productName} to cart`, 'Success', {timeOut: 2000});
      },
      error: (err) => {
        this.toasterService.error(`${err}`, 'Error', {timeOut: 2000});
      }
    })
  }
}
