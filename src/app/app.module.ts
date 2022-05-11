import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import type { Routes } from "@angular/router";
import { RouterModule } from "@angular/router";

import { AboutComponent } from "app/about/about.component";
import { AppComponent } from "app/app.component";
import { HelpModalComponent } from "app/help-modal/help-modal.component";
import { HelpComponent } from "app/help/help.component";
import { LightboxThumbnailComponent } from "app/lightbox-thumbnail/lightbox-thumbnail.component";
import { MazeBuilderComponent } from "app/maze-builder/maze-builder.component";
import { TrackClickDirective } from "app/track-click.directive";
import { WelcomeComponent } from "app/welcome/welcome.component";

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
        WelcomeComponent,
        TrackClickDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(appRoutes)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
