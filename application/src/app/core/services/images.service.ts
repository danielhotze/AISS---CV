import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Subscription } from 'rxjs';
import { Image } from '../models/image.model';
import { environment } from '../../../environments/environment';
import { handleError } from '../utility/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  public imageData$ = new BehaviorSubject<Image[]>([]);

  private _imageSubscription?: Subscription;

  constructor(
    private http: HttpClient
  ) { }

  // DATA
  get images(): Image[] {
    return this.imageData$.value;
  }
  set images(newImages: Image[]) {
    this.imageData$.next(newImages);
  }

  // API
  loadImages() {
    if (this._imageSubscription) {
      this._imageSubscription.unsubscribe();
    }
    const requestUrl = environment.api.incident_images_url;
    this._imageSubscription = this.http.get<Image[]>(requestUrl).pipe(
      catchError(handleError)
    ).subscribe((imagesResponse) => {
      this.imageData$.next(imagesResponse);
      console.log('Received images:', this.images);
    })
  }
}
