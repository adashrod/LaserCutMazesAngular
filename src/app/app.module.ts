import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";
import { AppComponent } from "app/app.component";
import { HelpModalComponent } from "app/help-modal/help-modal.component";

@NgModule({
    declarations: [
        AppComponent,
        MazeBuilderComponent,
        HelpModalComponent
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
