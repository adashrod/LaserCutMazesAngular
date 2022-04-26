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
        const w = window as any;
        if (typeof w.ga === "function") {
            w.ga("send", {
                hitType: "event",
                eventCategory: this.category,
                eventAction: "externalLink",
                eventLabel: this.label
            });
        }
    }
}
