import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ParcelTrackingComponent } from './parcel-tracking/parcel-tracking.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {path: '',component: LoginComponent},
  { path: 'parcel-tracking/:id', component: ParcelTrackingComponent }, 
  { path: 'order-tracking/:id', component: OrderTrackingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
