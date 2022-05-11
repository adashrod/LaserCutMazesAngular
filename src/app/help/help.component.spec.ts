import type { ComponentFixture} from "@angular/core/testing";
import { async, TestBed } from "@angular/core/testing";

import { HelpComponent } from "app/help/help.component";
import { LightboxThumbnailComponent } from "app/lightbox-thumbnail/lightbox-thumbnail.component";

describe("HelpComponent", () => {
    let component: HelpComponent;
    let fixture: ComponentFixture<HelpComponent>;

    beforeEach(async(() => {
        void TestBed.configureTestingModule({
            declarations: [
                HelpComponent,
                LightboxThumbnailComponent
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        void expect(component).toBeTruthy();
    });
});
