import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  public handleError(error: HttpErrorResponse, message: string) {
    if (error.status === 0) {
      // Client-side or Network-error
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Server returned code ${error.status}, body was: `, error.error);
    }

    // Show snackbar message
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });

    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
