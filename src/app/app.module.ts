import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";
import { AppComponent } from "app/app.component";
import { HelpComponent } from "app/help/help.component";
import { HelpModalComponent } from "app/help-modal/help-modal.component";
import { WelcomeComponent } from "app/welcome/welcome.component";
import { LightboxThumbnailComponent } from "./lightbox-thumbnail/lightbox-thumbnail.component";

const appRoutes: Routes = [{
    path: "welcome",
    component: WelcomeComponent
}, {
    path: "builder",
    component: MazeBuilderComponent
}, {
    path: "help",
    component: HelpComponent
}, {
    path: "",
    redirectTo: "/welcome",
    pathMatch: "full"
}];
@NgModule({
    declarations: [
        AppComponent,
        HelpComponent,
        HelpModalComponent,
        LightboxThumbnailComponent,
        MazeBuilderComponent,
        WelcomeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(appRoutes)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
