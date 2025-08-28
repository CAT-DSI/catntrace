import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

// @NgModule({
//   imports: [
//     BrowserAnimationsModule, // required for toastr animations
//     ToastrModule.forRoot({
//       timeOut: 3000,           // toast disappears after 3 seconds
//       positionClass: 'toast-top-right', // position of toasts
//       preventDuplicates: true, // prevent duplicate toasts
//     }),
//   ],
//   exports: [
//     ToastrModule,             // export so other modules/components can use Toastr services/directives
//     BrowserAnimationsModule,
//   ],
// })
// export class ToastrRootModule {}