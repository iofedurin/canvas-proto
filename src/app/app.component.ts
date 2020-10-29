import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';

import {Subject} from 'rxjs';
import {BotCanvas} from './classes/bot-canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'canvas-prototype';
  unsubscribe$ = new Subject();

  private botCanvas: BotCanvas;

  @ViewChild('canvasWrap') canvasWrap!: ElementRef<HTMLElement>;

  constructor() {}

  ngAfterViewInit(): void {
    this.botCanvas = new BotCanvas(this.canvasWrap.nativeElement);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addCard() {
    this.botCanvas.addBranch();
  }

   // drawBlock(): void {
   // const card = new Graphics();
   // card.beginFill(0xedebf2);
   // card.drawRoundedRect(50, 50, rectWidth, rectHeight, 10);
   // card.endFill();
   // card.interactive = true;
   // card.buttonMode = true;
   // card
   //   .on('pointerdown', onDragStart)
   //   .on('pointerup', onDragEnd)
   //   .on('pointerupoutside', onDragEnd)
   //   .on('pointermove', onDragMove);
   //
   // this.viewport.addChild(card);
   //
   // const circle = new Graphics();
   // circle.lineStyle(0);
   // circle.beginFill(0xDE3249, 1);
   // circle.drawCircle(60, 60, 7);
   // circle.endFill();
   //
   // card.addChild(circle);
   //
   // circle.interactive = true;
   // circle.buttonMode = true;
   //
   //
   // let drawing = false;
   // const viewport = this.viewport;
   // let prevLine: Graphics;
   //
   // const lineStart = (event: InteractionEvent) => {
   //   event.stopPropagation();
   //   drawing = true;
   // };
   // const lineMove = (event: InteractionEvent) => {
   //   if (drawing) {
   //     prevLine?.destroy();
   //     const line = new Graphics();
   //     line.lineStyle(3, 0xEB6734, 1);
   //     line.moveTo(card.x + 60, card.y + 60);
   //
   //     const relativePoint = viewport.toLocal(event.data.global);
   //     line.lineTo(relativePoint.x, relativePoint.y);
   //
   //     prevLine = line;
   //     viewport.addChild(line);
   //   }
   // };
   // document.addEventListener('mouseup', () => {
   //   if (drawing) {
   //     drawing = false;
   //     prevLine.destroy();
   //     prevLine = undefined;
   //   }
   // });
   // circle.on('pointerdown', lineStart)
   //   .on('pointermove', lineMove);
   //
   // function onDragStart(event): void {
   //   // the reason for this is because of multitouch
   //   // we want to track the movement of this particular touch
   //   this.data = event.data;
   //   this.alpha = 0.5;
   //   this.dragging = true;
   //   // чтоб ивент перемещения не прокидывался на полотно
   //   event.stopPropagation();
   // }
   //
   // function onDragEnd(): void {
   //   this.alpha = 1;
   //   this.dragging = false;
   //   // set the interaction data to null
   //   this.data = null;
   // }
   //
   // function onDragMove(event) {
   //   if (this.dragging) {
   //     const newPosition = this.data.getLocalPosition(this.parent);
   //     this.x = newPosition.x - rectWidth / 1.5;
   //     this.y = newPosition.y - rectHeight / 1.5;
   //   }
   // }
   // }
}
