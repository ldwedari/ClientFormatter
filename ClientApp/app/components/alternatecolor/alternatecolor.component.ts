
import { Component, NgZone, ChangeDetectorRef, ApplicationRef,
    ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ICharInfo } from './icharinfo'
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/fromEvent';

@Component({
    selector: 'alternate-color',
    templateUrl: './alternatecolor.component.html'
})
export class AlternateColorComponent {
    colorText = 'red';
    @ViewChild('colorText') colorTextRef: ElementRef;
    colors: string[];
    text: string;
    letterInfoArray: ICharInfo[];

    constructor(private ngzone: NgZone, private cdref: ChangeDetectorRef,
        private appref: ApplicationRef) { }
    ngAfterViewInit() {
        this.ngzone.runOutsideAngular(() => {
            Observable.fromEvent<KeyboardEvent>(this.colorTextRef.nativeElement, 'keyup')
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

    private escape(letter: string) : string
    {
        switch (letter) {
            //case '<': return "&lt;";
            //case '>': return "&gt;";
            default: return letter;
        }
    }
    private validateColorText() : boolean {
        return true;
    }
    private updateText()
    {
        this.text = "asdf dsfsd fa fasd fsda sdf <input> .sd sd,dsf.";
        if (!this.validateColorText())
            return;
        this.colorText = "red,green,blue";
        this.colors = this.colorText.split(',').map(color => color.trim());
        this.letterInfoArray = [];
        for (let indx = 0; indx < this.text.length; indx++)
        {
            this.letterInfoArray.push(
                {
                    letter: this.escape(this.text[indx]),
                    color: this.colors[indx % this.colors.length]
                });
        }
    }
}
