import { Directive, Input, HostListener } from "@angular/core";

@Directive({
    selector: "[appTrackClick]"
})
export class TrackClickDirective {
    @Input() category: string;
    @Input() label: string;

    constructor() {}

    @HostListener("click")
    onClick(): void {
        (<any>window).ga("send", {
            hitType: "event",
            eventCategory: this.category,
            eventAction: "externalLink",
            eventLabel: this.label
        });
    }
}
