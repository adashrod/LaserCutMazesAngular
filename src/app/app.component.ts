import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
    constructor(private router: Router) {
        const w = window as any;
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && typeof w.ga === "function") {
                w.ga("set", "page", event.urlAfterRedirects);
                w.ga("send", "pageview");
            }
        });
    }

    ngOnInit(): void {}
}
