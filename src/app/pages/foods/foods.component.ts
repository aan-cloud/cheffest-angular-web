import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface Food {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-foods',
  standalone: true,
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css'],
  imports: [CommonModule]
})
export class FoodsComponent implements OnInit {
  isLoading = false;
  foods: Food[] = [];
  apiUrl = "https://cheffest-backend-spring-production.up.railway.app"

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
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
        console.error('Error fetching foods:', error)
        this.isLoading = false
      }
    });
  }
}
