import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  statistics = [
    { number: '2M+', label: 'Happy Customers' },
    { number: '98%', label: 'Customer Satisfaction' },
    { number: '20+', label: 'Branches' },
    { number: '100+', label: 'Total Employees' }
  ];

  ratingsArray = Array.from({ length: 6 }, (_, i) => i);
}
