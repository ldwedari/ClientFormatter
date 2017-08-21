
import { Component, NgZone, ChangeDetectorRef, ApplicationRef,
    ViewChild, Input, SimpleChanges, OnChanges,
    QueryList, ElementRef} from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ICharInfo } from "./icharinfo"
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/throttleTime";
import "rxjs/add/observable/fromEvent";

// This is implemented as a separated component so that it can be replaced by a different text formatter.
@Component({
    selector: "alternate-color",
    templateUrl: "./alternatecolor.component.html",
    styleUrls: ['./alternatecolor.component.css']

})
export class AlternateColorComponent {
    colorText: string;
    @ViewChild("colorText") colorTextRef: ElementRef;
    @ViewChild("coloredText") coloredTextRef: ElementRef;
    colors: string[] = [];
    private _text: string;
    areColorsValid: boolean = false;
    invalidColor: string = "";
    elapsedTime: number = 0;
    private startTime: any;
    private endTime: any;
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
        this.colors = this.colorText
            .replace(/,|\n/g, ";")
            .split(";")
            .map(color => color.trim())
            .filter(color=> color!=="");
        this.validateColorText();
    }

    getNotRepeatingRandomNumber(max: number, previous: number) : number
    {
        let newRandom = Math.floor(Math.random() * max);
        if (previous >= 0 && newRandom == previous)
            newRandom = (newRandom + 1) % max;
        return newRandom;
    }

    // Manipulating the DOM is much faster than using Angular Templates.
    // In this case inserting 10's of thousands of letters this is needed.
    // An alternative using Templates is to be able to detect the text changes
    // and have angular insert only thouse ones. This would require an external
    // Diff JS library and some performance testing.
    private updateTextDOM() {
        let i = 0;
        let element: HTMLElement = this.coloredTextRef.nativeElement;

        if (!element)
            return;

        element.innerHTML = "";
        //while (element.firstChild) {
        //    element.removeChild(element.firstChild);
        //}
        var fragment = document.createDocumentFragment();
        let colorIndex: number = -1; 
        for (let char of this._text) {
            colorIndex = this.getNotRepeatingRandomNumber(this.colors.length, colorIndex);
            let node = document.createElement("span");
            node.style.color = this.colors[colorIndex];
            node.textContent = char;
            fragment.appendChild(node);
            if (char !== " " && char !== "\t")
                i++;
        }
        element.appendChild(fragment);
    }



    private updateTextTemplate() {
        let i = 0;
        let colorIndex: number = -1; 
        for (let char of this._text) {
            colorIndex = this.getNotRepeatingRandomNumber(this.colors.length, colorIndex);
            this.letterInfoArray.push(
                {
                    letter: char,
                    color: this.colors[colorIndex]
                });
            if (char !== " " && char !== "\t")
                i++;
        }
    }

    private updateText() {
        if (!this._text || !this.areColorsValid)
            return;
        this.letterInfoArray = [];
        this.startTime = new Date();
        this.updateTextDOM();
        //this.updateTextTemplate();
        this.endTime = new Date();
        this.elapsedTime = this.endTime - this.startTime;
    }
}
