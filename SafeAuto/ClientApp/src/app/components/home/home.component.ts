import { HttpClient, HttpEventType } from "@angular/common/http";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { map } from "rxjs/operators";
import { Trip } from "../../trip.model";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})

export class HomeComponent {
  public message: string;
  public progress: number;
  @Output() public onUploadFinished = new EventEmitter();
  loadedTrips: Trip[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.onFetchTrips();
  }

  onFetchTrips() {
    this.listTrips();
  }

  public uploadFile = (files) => {
    if (files.length === 0) {
      console.log("file length is 0");
      return;
    }

    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append("file", fileToUpload, fileToUpload.name);

    this.http
      .post("https://localhost:5001/api/trip", formData, {
        reportProgress: true,
        observe: "events",
      })
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.message = "Upload success.";
          this.onUploadFinished.emit(event.body);
        }
      });
  };

  private listTrips() {
    this.http.get("https://localhost:5001/api/trip")
      .pipe(map(responseData => {
        const tripsArray = [];
        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            tripsArray.push({ ...responseData[key]})
          }
        }
        return tripsArray;
      }))
      .subscribe(trips => {
        this.loadedTrips = trips;
      });
  }
}