
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
    templateUrl: "./alternatecolor.component.html",
    styleUrls: ['./alternatecolor.component.css']

})
export class AlternateColorComponent implements OnChanges {
    colorText: string;
    @ViewChild("colorText") colorTextRef: ElementRef;
    @ViewChild("coloredText") coloredTextRef: ElementRef;
    colors: string[] = [];
    private _text: string;
    areColorsValid: boolean = false;
    invalidColor: string = "";
    elapsedTime: number;
    @Input('text')
    set in(value: string) {
        this._text = value;
        this.updateText();
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
                    this.parseColors();
                    this.updateText();
                    this.cdref.detectChanges();
                });

        });
    }
    ngOnChanges(changes: SimpleChanges) {
    } 

    private validateColorText(): boolean {
        this.invalidColor = "";
        this.areColorsValid = false;
        const colorTest = document.getElementById("colorTest");
        if (colorTest == null)
            return false;
        for (let color of this.colors) {
            colorTest.style.color = "";
            colorTest.style.color = color;
            if (!(colorTest.style.color)) {
                this.invalidColor = color;
                return false;
            }
        }
        this.areColorsValid = true;
        return true;
    }

    private parseColors() {
        this.colors = this.colorText.split(";").map(color => color.trim());
        this.validateColorText();
    }

    private updateText() {
        let startTime : any = new Date();
        if (!this._text || !this.areColorsValid)
            return;
        this.letterInfoArray = [];
        let i = 0;
        //let element: HTMLElement = this.coloredTextRef.nativeElement;

        let element = document.getElementById("coloredText");
        if (!element)
            return;
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        var fragment = document.createDocumentFragment();
        for (let char of this._text) {
            let node = document.createElement("span");
            //let textNode = document.createTextNode(char);
            //node.appendChild(textNode);
            node.style.color = this.colors[i % this.colors.length];
            node.textContent = char;
            fragment.appendChild(node);
            //this.letterInfoArray.push(
            //    {
            //        letter: char,
            //        color: this.colors[i % this.colors.length]
            //    });
            if (char !== " " && char !== "\t")
                i++;
        }
        element.appendChild(fragment);
        let endTime: any = new Date();
        this.elapsedTime = endTime - startTime;
    }
}
