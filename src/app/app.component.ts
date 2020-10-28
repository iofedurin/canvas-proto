import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild} from '@angular/core';

import * as PIXI from 'pixi.js';
import {DOCUMENT} from '@angular/common';
import {Viewport} from 'pixi-viewport';
import {Branch, Connection} from './classes';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'canvas-prototype';
  unsubscribe$ = new Subject();

  private pixiApp: PIXI.Application;
  private viewport: Viewport;
  private processingConnection?: Connection;

  @ViewChild('canvasWrap') canvasWrap!: ElementRef<HTMLElement>;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
  }

  ngAfterViewInit(): void {
    this.initPixiAndViewPort();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addCard() {
    const card = new Branch();
    this.viewport.addChild(card.canvasContainer);
    card.dotClicks
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(emittedCard => {
        if (!this.processingConnection) {
          this.processingConnection = Connection.create(this.viewport);
        }
        console.log('1', this.processingConnection);
        this.processingConnection.addCard(emittedCard);
      });
    card.mouseUp.subscribe(emittedCard => {
      if (this.processingConnection?.first) {
        this.processingConnection.addCard(emittedCard);
      }
    });
  }

  initPixiAndViewPort() {
    this.pixiApp = new PIXI.Application({backgroundColor: 0xFFFFFF, resizeTo: this.canvasWrap.nativeElement});
    this.document.body.appendChild(this.pixiApp.view);

    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,
      interaction: this.pixiApp.renderer.plugins.interaction
    });
    this.viewport.drag().wheel();
    this.pixiApp.stage.addChild(this.viewport);
    this.viewport.on('pointerup', (event) => {
      console.log('viewport up');
      console.log(this.processingConnection);
      this.processingConnection?.drop();
    });
  }

   //drawBlock(): void {
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
   //}
}
