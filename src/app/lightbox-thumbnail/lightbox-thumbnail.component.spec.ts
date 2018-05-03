import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { LightboxThumbnailComponent } from "app/lightbox-thumbnail/lightbox-thumbnail.component";

describe("LightboxThumbnailComponent", () => {
    let component: LightboxThumbnailComponent;
    let fixture: ComponentFixture<LightboxThumbnailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
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
        expect(component).toBeTruthy();
    });
});
