import type { ComponentFixture} from "@angular/core/testing";
import { async, TestBed } from "@angular/core/testing";

import { LightboxThumbnailComponent } from "app/lightbox-thumbnail/lightbox-thumbnail.component";

describe("LightboxThumbnailComponent", () => {
    let component: LightboxThumbnailComponent;
    let fixture: ComponentFixture<LightboxThumbnailComponent>;

    beforeEach(async(() => {
        void TestBed.configureTestingModule({
            declarations: [ LightboxThumbnailComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LightboxThumbnailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        void expect(component).toBeTruthy();
    });
});
