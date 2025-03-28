import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { FoodsComponent } from './pages/foods/foods.component'

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
          { path: '', component: HomeComponent },
          { path: 'foods', component: FoodsComponent}
        //   { path: 'about', component: AboutComponent }
        ]
    }
];
