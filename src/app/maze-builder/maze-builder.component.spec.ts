import { FormsModule } from "@angular/forms";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { HelpModalComponent } from "app/help-modal/help-modal.component";
import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";

describe("MazeBuilderComponent", () => {
    let component: MazeBuilderComponent;
    let fixture: ComponentFixture<MazeBuilderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
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
        expect(component).toBeTruthy();
    });
});
