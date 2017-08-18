
import { Component, NgZone, ChangeDetectorRef, ApplicationRef,
    ViewChild, ElementRef } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ICharInfo } from "./icharinfo"
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/throttleTime";
import "rxjs/add/observable/fromEvent";

@Component({
    selector: "alternate-color",
    templateUrl: "./alternatecolor.component.html"
})
export class AlternateColorComponent {
    colorText = "red";
    @ViewChild("colorText") colorTextRef: ElementRef;
    colors: string[];
    text: string;
    letterInfoArray: ICharInfo[];

    constructor(private ngzone: NgZone, private cdref: ChangeDetectorRef,
        private appref: ApplicationRef) { }
    ngAfterViewInit() {
        this.ngzone.runOutsideAngular(() => {
            Observable.fromEvent<KeyboardEvent>(this.colorTextRef.nativeElement, "keyup")
                .debounceTime(300)
                .distinctUntilChanged()
                .subscribe(keyboardEvent => {
                    this.colorText = (<HTMLTextAreaElement>keyboardEvent.target).value;
                    //console.log(this.colorText);
                    this.updateText();
                    this.cdref.detectChanges();
                });
        });
    }

    private validateColorText(): boolean {
        const colorTest = document.getElementById("colorTest");
        if (colorTest == null)
            return false;
        for (let color of this.colors) {
            colorTest.style.color = "";
            colorTest.style.color = color;
            if (!(colorTest.style.color))
                return false;
        }
        return true;
    }

    private updateText() {
        this.text = "asdf dsfsd fa fasd fsda sdf <input> .sd sd,dsf.";
        this.colors = this.colorText.split(";").map(color => color.trim());
        if (!this.validateColorText())
            return;
        this.letterInfoArray = [];
        let i = 0;
        for (let char of this.text) {
            this.letterInfoArray.push(
                {
                    letter: char,
                    color: this.colors[i % this.colors.length]
                });
            if (char !== " " && char !== "\t")
                i++;
        }
    }
}
