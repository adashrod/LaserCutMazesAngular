import { FormsModule } from "@angular/forms";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";

describe("MazeBuilderComponent", () => {
    let component: MazeBuilderComponent;
    let fixture: ComponentFixture<MazeBuilderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [MazeBuilderComponent]
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
