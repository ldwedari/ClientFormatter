
import { Component, NgZone, ChangeDetectorRef, ApplicationRef,
    ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/fromEvent';

@Component({
    selector: 'input-formatter',
    templateUrl: './input.component.html'
})
export class InputComponent {
    inputText: string;
    @ViewChild('inputTextBox') inputTextRef: ElementRef;
    //text: string;
    constructor(private ngzone: NgZone, private cdref: ChangeDetectorRef,
        private appref: ApplicationRef) { }
    ngAfterViewInit() {
        this.ngzone.runOutsideAngular(() => {
            Observable.fromEvent<KeyboardEvent>(this.inputTextRef.nativeElement, 'keyup')
                .debounceTime(500)
                .distinctUntilChanged()
                .subscribe(keyboardEvent => {
                    this.inputText = (<HTMLTextAreaElement>keyboardEvent.target).value;
                    //console.log(this.inputText);
                    this.cdref.detectChanges();
                });
        });
    }
}
