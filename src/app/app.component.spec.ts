/* tslint:disable:no-unused-variable */

import { FormsModule } from "@angular/forms";
import { TestBed, async } from "@angular/core/testing";

import { HelpModalComponent } from "app/help-modal/help-modal.component";
import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";
import { AppComponent } from "app/app.component";

describe("AppComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [
                AppComponent,
                HelpModalComponent,
                MazeBuilderComponent
            ],
        });
        TestBed.compileComponents();
    });

    it("should create the app", async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
});
