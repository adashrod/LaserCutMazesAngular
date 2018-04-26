import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "app-help-modal",
    templateUrl: "./help-modal.component.html",
    styleUrls: ["./help-modal.component.css"]
})
export class HelpModalComponent implements OnInit {
    private static instances: HelpModalComponent[] = [];

    showHelpModal: boolean = false;
    @Input() popLeft: boolean;
    @Input() glow: boolean;

    constructor() {}

    ngOnInit() {
        HelpModalComponent.instances.push(this);
    }

    toggle(): void {
        for (const comp of HelpModalComponent.instances) {
            if (comp !== this) {
                comp.close();
            }
        }
        this.showHelpModal = !this.showHelpModal;
    }

    close(): void {
        this.showHelpModal = false;
    }
}
