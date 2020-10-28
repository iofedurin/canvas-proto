import {Connection} from './connection';
import {Container, Graphics, InteractionEvent} from 'pixi.js';
import {Subject} from 'rxjs';

export type BranchOptions = {
  /**
   * default: false; Indicates if a branch can be linked as a child.
   */
  canBeLinked?: string;
};

export class Branch {
  public height = 40;
  private readonly container: Container;
  public connection: Connection;
  public connectionPoint: Graphics;
  private dotClick$ = new Subject<Branch>();
  private mouseUp$ = new Subject<Branch>();

  constructor(options?: BranchOptions) {
    this.container = this.initBranchContainer();
    this.initCardListeners();
  }

  get dotClicks() {
    return this.dotClick$.asObservable();
  }

  get mouseUp() {
    return this.mouseUp$.asObservable();
  }

  get canvasContainer() {
    return this.container;
  }

  /**
   * Создаем блок с текстом и кнопкой для создания связи
   */
  private initBranchContainer(): Container {
    /**
     * Рисуем прямоугольник, делаем его интерактивным (шлет ивенты на нажатия).
     * buttonMode === cursor: pointer;
     */
    const drawCard = () => {
      const rectangle = new Graphics();
      rectangle.lineStyle(1.5, 0xC7CAD1);
      rectangle.beginFill(0xFFFFFF);
      rectangle.drawRoundedRect(50, 50, 100, this.height, 10);
      rectangle.endFill();
      rectangle.interactive = true;
      rectangle.buttonMode = true;
      return rectangle;
    };

    const drawConnectionPoint = () => {
      const circle = new Graphics();
      circle.beginFill(0xDE3249, 1);
      circle.drawCircle(60, 60, 7);
      circle.endFill();
      circle.interactive = true;
      circle.buttonMode = true;
      return circle;
    };

    const container = new Container();
    const card = drawCard();
    const connectionPoint = drawConnectionPoint();
    container.addChild(card);
    container.addChild(connectionPoint);
    return card;
  }

  private initCardListeners() {
    let data;
    let dragging = false;
    const onDragStart = (event) => {
      this.container.alpha = 0.7; // opacity
      data = event.data;
      dragging = true;
      event.stopPropagation(); // чтоб ивент перемещения не прокидывался на полотно
    };
    const onDragEnd = () => {
      this.container.alpha = 1;
      dragging = false;
      data = null;
    };
    const emitMouseUp = (event: InteractionEvent) => {
      console.log('card up');
      this.mouseUp$.next(this);
      event.stopPropagation();
    };
    const onDragMove = () => {
      if (dragging) {
        const newPosition = data.getLocalPosition(this.container.parent);
        this.container.x = newPosition.x - 100 / 1.5;
        this.container.y = newPosition.y - this.height / 1.5;
      }
    };
    this.container
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerup', emitMouseUp)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove);
  }

  private initDotListeners() {
    this.connectionPoint.on('pointerdown', (event: MouseEvent) => {
      event.stopPropagation();
      this.dotClick$.next(this);
    });
  }
}
