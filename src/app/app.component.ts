import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

import {BotCanvas} from './classes/bot-canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'canvas-prototype';

  private botCanvas: BotCanvas;

  @ViewChild('canvasWrap') canvasWrap!: ElementRef<HTMLElement>;

  constructor() {}

  ngAfterViewInit(): void {
    this.botCanvas = new BotCanvas(this.canvasWrap.nativeElement);
  }

  addCard() {
    this.botCanvas.addBranch();
  }
}
