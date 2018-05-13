import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";
import { AppComponent } from "app/app.component";
import { HelpComponent } from "app/help/help.component";
import { HelpModalComponent } from "app/help-modal/help-modal.component";
import { WelcomeComponent } from "app/welcome/welcome.component";
import { LightboxThumbnailComponent } from "app/lightbox-thumbnail/lightbox-thumbnail.component";
import { AboutComponent } from "app/about/about.component";

const appRoutes: Routes = [{
    path: "LaserCutMazes/welcome",
    component: WelcomeComponent
}, {
    path: "LaserCutMazes/designer",
    component: MazeBuilderComponent
}, {
    path: "LaserCutMazes/help",
    component: HelpComponent
}, {
    path: "LaserCutMazes/about",
    component: AboutComponent
}, {
    path: "LaserCutMazes",
    redirectTo: "LaserCutMazes/welcome",
    pathMatch: "prefix"
}];
@NgModule({
    declarations: [
        AboutComponent,
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
