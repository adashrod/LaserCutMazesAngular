import type { ComponentFixture} from "@angular/core/testing";
import { async, TestBed } from "@angular/core/testing";

import { HelpModalComponent } from "app/help-modal/help-modal.component";

describe("HelpModalComponent", () => {
    let component: HelpModalComponent;
    let fixture: ComponentFixture<HelpModalComponent>;

    beforeEach(async(() => {
        void TestBed.configureTestingModule({
            declarations: [
                HelpModalComponent
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        void expect(component).toBeTruthy();
    });
});
