import {Connection} from './connection';
import {Container, Graphics, InteractionData, InteractionEvent} from 'pixi.js';
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
  /**
   * Сабджект, чтоб эмитить нажатия на кнопку
   * @private
   */
  private dotClick$ = new Subject<Graphics>();
  /**
   * Сабджект, чтоб эмитить, что отпустили на прямоугольнике
   * @private
   */
  private mouseUp$ = new Subject<Graphics>();

  constructor(options?: BranchOptions) {
    this.container = this.initBranchContainer();
    this.initDragListeners();
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
      rectangle.drawRoundedRect(0, 0, 100, this.height, 10);
      rectangle.endFill();
      rectangle.interactive = true;
      rectangle.buttonMode = true;
      return rectangle;
    };
    /**
     * Рисуем прямоугольник, делаем его интерактивным (шлет ивенты на нажатия).
     * buttonMode === cursor: pointer;
     * @param wrapper - элемент, на ширину которого нужно ориентироваться при позиционировании кнопки
     */
    const drawConnectionPoint = (wrapper: Container) => {
      const circle = new Graphics();
      circle.lineStyle(1.5, 0x000000, 1);
      circle.beginFill(0xFFFFFF, 1);
      const circleRadius = 4;
      // вычетание половины радиуса нужно, чтоб оцентровать его
      circle.drawCircle(- circleRadius / 2, - circleRadius / 2, circleRadius);
      circle.endFill();
      circle.interactive = true;
      circle.buttonMode = true;
      circle.x = wrapper.width;
      circle.y = wrapper.height / 2;
      return circle;
    };

    const container = new Container();
    const card = drawCard();
    const connectionPoint = drawConnectionPoint(card);
    container.addChild(card);
    container.addChild(connectionPoint);
    return container;
  }

  /**
   * Обработка ивентов для перемещения блока по канвасу
   * @private
   */
  private initDragListeners() {
    let data: InteractionData; // инфа о ивенте mousedown по элементу
    let dragging = false; // маркер того, идет ли перемещиение эелемента в данный момент

    const onDragStart = (event: InteractionEvent) => {
      this.container.alpha = 0.7; // opacity
      data = event.data;
      dragging = true;
      event.stopPropagation(); // чтоб ивент нажатия на элемент не прокидывался на полотно
    };
    const onDragEnd = () => {
      this.container.alpha = 1;
      dragging = false;
      data = null;
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
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove);
  }

  //private initDotListeners() {
  //  this.connectionPoint.on('pointerdown', (event: MouseEvent) => {
  //    event.stopPropagation();
  //    this.dotClick$.next(this);
  //  });
  //}
}
