import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-help-modal",
    templateUrl: "./help-modal.component.html",
    styleUrls: ["./help-modal.component.css"]
})
export class HelpModalComponent implements OnInit {
    private static instances: HelpModalComponent[] = [];

    public showHelpModal: boolean = false;
    @Input() public popLeft: boolean;
    @Input() public glow: boolean;

    public ngOnInit(): void {
        HelpModalComponent.instances.push(this);
    }

    public toggle(): void {
        for (const comp of HelpModalComponent.instances) {
            if (comp !== this) {
                comp.close();
            }
        }
        this.showHelpModal = !this.showHelpModal;
    }

    public close(): void {
        this.showHelpModal = false;
    }
}
