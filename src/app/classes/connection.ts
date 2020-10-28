import {Branch} from './branch';
import {Graphics, InteractionEvent} from 'pixi.js';
import {fromEvent, Subject, Subscription} from 'rxjs';

import {Viewport} from 'pixi-viewport';

export interface IPoint {
  x: number;
  y: number;
}

export class Connection extends Graphics {
  first?: Branch;
  second?: Branch;
  drawing = false;
  viewport: Viewport;
  prevLine: any;

  mouseup = fromEvent(document, 'mouseup');
  mousemoveSub?: Subscription;

  private line$ = new Subject();

  constructor(geometry?: PIXI.GraphicsGeometry) {
    super(geometry);
  }

  static create(viewPort: Viewport): Connection {
    const connection = new Connection();
    connection.viewport = viewPort;
    return connection;
  }

  setViewPort(vp) {
    this.viewport = vp;
  }

  addCard(card: Branch) {
    if (!this.first) {
      this.first = card;
      this.startDrawing(card.connectionPoint);
    } else {
      this.second = card;
      this.endDrawing();
    }
  }

  drop() {
    this.endDrawing();
    this.first = undefined;
    this.second = undefined;
  }

  startDrawing(dot) {
    this.drawing = true;
    this.mousemoveSub = fromEvent(dot, 'pointermove').subscribe((event: InteractionEvent) => {
      this.prevLine?.destroy();

      const line = new Graphics();
      line.lineStyle(3, 0xEB6734, 1);
      line.moveTo(this.first.x + 60, this.first.y + 60);

      const relativePoint = this.viewport.toLocal(event.data.global);
      line.lineTo(relativePoint.x, relativePoint.y);

      this.prevLine = line;
      this.viewport.addChild(line);
    });
  }

  endDrawing() {
    this.mousemoveSub.unsubscribe();
    this.drawing = false;
  }

  switchDirection() {}

  remove() {}


}

