import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';
import { Observable } from 'rxjs';
import { OrderModel, ParcelDetail } from '../Models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private httpHelper: HttpHelperService) { }

  orderParcelTracking(OrderNo:string): Observable<OrderModel[]> {   
    return this.httpHelper.get(`/OrderTracking/${encodeURIComponent(OrderNo)}`);   
  }

   orderParcelTrackingBy_Seq(orderId:string, seqNo: number): Observable<ParcelDetail[]> {   
    
    return this.httpHelper.get(`/OrderTracking/by-seq?orderId=${orderId}&seqNo=${seqNo}`);   
  }
}
