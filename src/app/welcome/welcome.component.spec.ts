import type { ComponentFixture} from "@angular/core/testing";
import { async, TestBed } from "@angular/core/testing";

import { WelcomeComponent } from "app/welcome/welcome.component";

describe("WelcomeComponent", () => {
    let component: WelcomeComponent;
    let fixture: ComponentFixture<WelcomeComponent>;

    beforeEach(async(() => {
        void TestBed.configureTestingModule({
            declarations: [ WelcomeComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WelcomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        void expect(component).toBeTruthy();
    });
});
