import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { Router } from "@angular/router";
import { Observable, Subject, defer, from } from 'rxjs';
import { LoginDialogueComponent } from '../../views/sessions/login-dialogue/login-dialogue.component';
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  refreshTokenInProgress: boolean = false;
  dialogRef: any;

  tokenRefreshedSource = new Subject();
  tokenRefreshed$ = this.tokenRefreshedSource.asObservable();
  constructor(private router: Router, private dialog: MatDialog) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authHandle = defer(() => {
      return next.handle(request);
    });
    return authHandle.pipe(
      catchError((requestError, retryRequest) => {
        if (requestError instanceof HttpErrorResponse && requestError.status === 401) {
          if (this.dialogRef == undefined) {
            this.dialogRef = this.dialog.open(LoginDialogueComponent, {
              width: '400px', disableClose: true
            });
          }
          return from(this.dialogRef.afterClosed()).pipe(tap(() => this.dialogRef = undefined), mergeMap(() => retryRequest));
        }
        else {
          return [];
        }
      })
    );
  }
}