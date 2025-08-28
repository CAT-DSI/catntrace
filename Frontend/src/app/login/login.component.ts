import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MyToastrService } from '../../shared/Services/my-toastr.service';
import { OrderService } from '../../shared/Services/order.service';
import { ParcelService } from '../../shared/Services/parcel.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  title = 'CATnTRACE';
  searchTypes = [
    { value: 'parcel', display: 'Parcel' },
    { value: 'clientOrder', display: 'Client Order no' },
  ];
  selectedSearchType = 'parcel';
  barcodeExtId = '';
  showDetails = false;


  constructor(private router: Router,
    private fb: FormBuilder,
    private toastr: MyToastrService,
    private orderService: OrderService,
    private parcelService : ParcelService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      selectedSearchType: [this.selectedSearchType, Validators.required],
      barcodeExtId: ['', Validators.required],
    });
  }

  onSearch() {
    debugger
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const searchType = this.loginForm.get('selectedSearchType')?.value;
    const barcodeExtId = this.loginForm.get('barcodeExtId')?.value;

    if (searchType === 'parcel') {
      this.parcelService.parcelTracking(barcodeExtId).subscribe({
        next: (response) => {
          if (response.length && response[0].errorMessage) {
            const msg = response[0].errorMessage;
            if (msg === "An ambiguous answer. Please contact Customer Service Department.") {
              this.toastr.info(msg);
            } else if (msg === "Parcel no has not been found.") {
              this.toastr.warning(msg);
            } else {
              this.toastr.warning(msg); // fallback for other error messages
            }           
          } else {
            this.router.navigate(['/parcel-tracking', barcodeExtId]);
          }
        },
        error: (err) => {
          this.toastr.error('API call failed. Please try again.');
          console.error(err);
        }
      });
      //this.router.navigate(['/parcel-tracking', barcodeExtId]);
    } else if (searchType === 'clientOrder') {
      this.orderService.orderParcelTracking(barcodeExtId).subscribe({
        next: (response) => {
          if (response.length && response[0].errorMessage) {
            const msg = response[0].errorMessage;
            if (msg === "An ambiguous answer. Please contact Customer Service Department.") {
              this.toastr.info(msg);
            } else if (msg === "Client Order no has not been found.") {
              this.toastr.warning(msg);
            } else {
              this.toastr.warning(msg); // fallback for other error messages
            }

            //this.toastr.warning(response[0].errorMessage);
          } else {
            this.router.navigate(['/order-tracking', barcodeExtId]);
          }
        },
        error: (err) => {
          this.toastr.error('API call failed. Please try again.');
          console.error(err);
        }
      });
      //this.router.navigate(['/order-tracking', barcodeExtId]);
    }
  }

  goBack() {
    this.showDetails = false;
  }

}

