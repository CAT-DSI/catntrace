import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
 requestCount = 0; 
  private loadingStatus = new BehaviorSubject(false);  
  isLoading = this.loadingStatus.asObservable().pipe( delay(0) );
  constructor() { }


  /*
    add a new request to the count and emit a newloading status if needed,
    it accepts the observable response of the request and when it completes we return back the observable
   */
  addRequest(request: Observable<any>): Observable<any> {
    if (this.requestCount === 0) {
      this.loadingStatus.next(true);
    }
    this.requestCount += 1;
     return request.pipe( finalize(() => this.completeRequest()) );
  } 

  // complete an existing request
  completeRequest() {
    this.requestCount -= 1;
    if (this.requestCount === 0) {
      this.loadingStatus.next(false);
    }
  }
}