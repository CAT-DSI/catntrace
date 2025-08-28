import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

const API_BASE_URL = environment.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export class HttpHelperService { 
  constructor(private http: HttpClient) { }

   /**
   * Performs a request with `get` http method.
   * default query params (pagination) are added to each get request
   * @param url the url
   * @param options the request options
   */
  get(url: string, options?: any): Observable<any> {

    if (options == null) {
      options = {};
    }

    if (options.headers == null) {
      options.headers = new HttpHeaders();
    }
    // IE 11 caches get requests, to avoid this we set these Http headers
    options.headers = options.headers.set('Cache-Control', 'no-cache').set('Pragma', 'no-cache');

    return this.http
      .get(API_BASE_URL + url, this.requestOptions({ ...options, params: { ...(options ? options.params : {}) } }));
  }

  /**
   * Performs a request with `post` http method.
   * @param url the url
   * @param body the body
   * @param options the request options
   */
  post(url: string, body: any, options?: any, isUpload?: boolean): Observable<any> {
    
    return this.http
      .post(API_BASE_URL + url, body, this.requestOptions(options, isUpload));
  }


  /**
   * Wrapper for an upload file post request, to handle progress events, etc
   * @param url the url
   * @param file - the file to be uploaded
   * @param options the request options
   */
  upload(url: string, file: File, options?: any): Observable<any> {
    // pass file to uploaded as formData
    const formData = new FormData();
    formData.append('file', file);

    const uploadOptions = {
      reportProgress: true,
      observe: 'events'
    };

    return this.post(url, formData, { ...options, ...uploadOptions }, true)
      .pipe(
        map((event: HttpEvent<any>) => {
          switch (event.type) {

            case HttpEventType.Sent:
              return { status: 'progress', progress: 0 };

            case HttpEventType.UploadProgress:
              const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
              return { status: 'progress', progress };

            case HttpEventType.Response:
              return { status: 'completed', completedResponse: event.body };

            default:
              return `Unhandled Event: ${event.type}`;
          }
        })
      );
  }

  /**
   * Performs a request with `put` http method.
   * @param url the url
   * @param body the body
   * @param options the request options
   */
  put(url: string, body: any, options?: any, isUpload?: boolean): Observable<any> {
    return this.http
      .put(API_BASE_URL + url, body, this.requestOptions(options, isUpload));
  }

  /**
   * Performs a request with `delete` http method.
   * @param url the url
   * @param options the request options
   */
  delete(url: string, options?: any): Observable<any> {
    return this.http
      .delete(API_BASE_URL + url, this.requestOptions(options));
  }

  /**
   * Configure request options.
   * @param options - request options
   * @param isUpload the flag if the request is made for upload
   */
  private requestOptions(options?: any, isUpload?: boolean): any {

    if (options == null) {
      options = {};
    }

    if (options.headers == null) {
      options.headers = new HttpHeaders();
    }


     if (options.params != null && typeof options.params !== 'string') {
    Object.keys(options.params).forEach(key => {
      const value = options.params[key];
      if (!value && !(typeof value === 'string' && value.length === 0)) {
        delete options.params[key];
      }
    });
  }
   
  }
}
