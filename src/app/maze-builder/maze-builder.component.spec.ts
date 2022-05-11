import type { ComponentFixture} from "@angular/core/testing";
import { async, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { HelpModalComponent } from "app/help-modal/help-modal.component";
import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";

describe("MazeBuilderComponent", () => {
    let component: MazeBuilderComponent;
    let fixture: ComponentFixture<MazeBuilderComponent>;

    beforeEach(async(() => {
        void TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [
                HelpModalComponent,
                MazeBuilderComponent
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MazeBuilderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        void expect(component).toBeTruthy();
    });
});
