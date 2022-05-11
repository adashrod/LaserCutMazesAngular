import { Directive, HostListener, Input } from "@angular/core";

@Directive({
    selector: "[appTrackClick]"
})
export class TrackClickDirective {
    @Input() public category: string;
    @Input() public label: string;

    @HostListener("click")
    public onClick(): void {
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
