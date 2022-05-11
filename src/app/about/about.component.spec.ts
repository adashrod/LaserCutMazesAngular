import type { ComponentFixture} from "@angular/core/testing";
import { async, TestBed } from "@angular/core/testing";

import { AboutComponent } from "app/about/about.component";

describe("AboutComponent", () => {
    let component: AboutComponent;
    let fixture: ComponentFixture<AboutComponent>;

    beforeEach(async(() => {
        void TestBed.configureTestingModule({
            declarations: [
                AboutComponent
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AboutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        void expect(component).toBeTruthy();
    });
});
