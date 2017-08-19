
import { Component, NgZone, ChangeDetectorRef, ApplicationRef,
    ViewChild, ElementRef, Input, SimpleChanges, OnChanges } from "@angular/core";
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
export class AlternateColorComponent implements OnChanges {
    colorText: string;
    @ViewChild("colorText") colorTextRef: ElementRef;
    colors: string[] = [];
    private _text: string;

    @Input('text')
    set in(inputText: string) {
        this._text = inputText;
        if (!this._text || this.colors.length == 0)
            return;
        this.letterInfoArray = [];
        let i = 0;
        for (let char of this._text) {
            this.letterInfoArray.push(
                {
                    letter: char,
                    color: this.colors[i % this.colors.length]
                });
            if (char !== " " && char !== "\t")
                i++;
        }
    }

    letterInfoArray: ICharInfo[];

    constructor(private ngzone: NgZone, private cdref: ChangeDetectorRef,
        private appref: ApplicationRef) { }

    ngAfterViewInit() {
        this.ngzone.runOutsideAngular(() => {
            Observable.fromEvent<KeyboardEvent>(this.colorTextRef.nativeElement, "keyup")
                .debounceTime(500)
                .distinctUntilChanged()
                .subscribe(keyboardEvent => {
                    this.colorText = (<HTMLTextAreaElement>keyboardEvent.target).value;
                    this.updateText();
                    this.cdref.detectChanges();
                });

        });
    }
    ngOnChanges(changes: SimpleChanges) {
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
        if (!this._text)
            return; 
        this.colors = this.colorText.split(";").map(color => color.trim());
        if (!this.validateColorText())
            return;
        this.letterInfoArray = [];
        let i = 0;
        for (let char of this._text) {
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
