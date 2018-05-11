import { AfterViewInit, Component, ElementRef, OnInit, Input, ViewChild } from "@angular/core";

@Component({
    selector: "app-lightbox-thumbnail",
    templateUrl: "./lightbox-thumbnail.component.html",
    styleUrls: ["./lightbox-thumbnail.component.css"]
})
export class LightboxThumbnailComponent implements OnInit {
    @Input() title: string;
    @Input() image: string;
    @Input() thumbnailWidth: number;
    @Input() thumbnailHeight: number;
    @ViewChild("thumbnail") thumbnail: ElementRef;
    shown: boolean = false;

    constructor() {}

    ngOnInit() {
        this.thumbnail.nativeElement.onload = () => {
            const aspectRatio = this.thumbnail.nativeElement.width / this.thumbnail.nativeElement.height;
            if (this.thumbnailWidth) {
                this.thumbnail.nativeElement.setAttribute("width", this.thumbnailWidth);
                this.thumbnail.nativeElement.setAttribute("height", Math.round(this.thumbnailWidth / aspectRatio));
            } else if (this.thumbnailHeight) {
                this.thumbnail.nativeElement.setAttribute("width", Math.round(this.thumbnailHeight * aspectRatio));
                this.thumbnail.nativeElement.setAttribute("height", this.thumbnailHeight);
            }
        };
    }

    showLightbox() {
        this.shown = true;
    }

    hideLightbox() {
        this.shown = false;
    }
}
