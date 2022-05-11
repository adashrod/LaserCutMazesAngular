import type { OnInit} from "@angular/core";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";

@Component({
    selector: "app-lightbox-thumbnail",
    templateUrl: "./lightbox-thumbnail.component.html",
    styleUrls: ["./lightbox-thumbnail.component.css"]
})
export class LightboxThumbnailComponent implements OnInit {
    @Input() public title: string;
    @Input() public image: string;
    @Input() public thumbnailWidth: number;
    @Input() public thumbnailHeight: number;
    @ViewChild("thumbnail") private thumbnail: ElementRef;
    public shown: boolean = false;

    public ngOnInit(): void {
        this.thumbnail.nativeElement.onload = (): void => {
            const aspectRatio = this.thumbnail.nativeElement.width / this.thumbnail.nativeElement.height;
            if (typeof this.thumbnailWidth === "number") {
                this.thumbnail.nativeElement.setAttribute("width", this.thumbnailWidth);
                this.thumbnail.nativeElement.setAttribute("height", Math.round(this.thumbnailWidth / aspectRatio));
            } else if (typeof this.thumbnailHeight === "number") {
                this.thumbnail.nativeElement.setAttribute("width", Math.round(this.thumbnailHeight * aspectRatio));
                this.thumbnail.nativeElement.setAttribute("height", this.thumbnailHeight);
            }
        };
    }

    public showLightbox(): void {
        this.shown = true;
    }

    public hideLightbox(): void {
        this.shown = false;
    }
}
