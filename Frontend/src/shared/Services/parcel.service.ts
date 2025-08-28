import { Injectable } from '@angular/core';
import { HttpHelperService } from './http-helper.service';
import { Observable } from 'rxjs';
import { OrderModel, ParcelDetail } from '../Models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {

  constructor(private httpHelper: HttpHelperService) { }
 
   parcelTracking(OrderNo:string): Observable<OrderModel[]> {   
     return this.httpHelper.get(`/ParcelTracking/${encodeURIComponent(OrderNo)}`);   
   }
 
    parcelTrackingBy_Seq(parcelId:string, seqNo: number): Observable<ParcelDetail[]> {   
      debugger
      return this.httpHelper.get(`/ParcelTracking/by-seq?parcelId=${parcelId}&seqNo=${seqNo}`);   
   }
  }
