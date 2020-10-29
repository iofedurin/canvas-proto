import {Connection} from './connection';
import {Container, Graphics, InteractionData, InteractionEvent, Text, TextStyle} from 'pixi.js';
import {Subject} from 'rxjs';

const TEXT_STYLE = new TextStyle({
  fontSize: 12,
});

export type BranchOptions = {
  /**
   * default: false; Indicates if a branch can be linked as a child.
   */
  canBeLinked?: string;
};

export class Branch {
  /**
   * Высота блока
   */
  public height = 40;
  /**
   * Боковые отступы текста от краев блока
   */
  public textSideMargin = 40;
  /**
   * Максимальное количество символов в тексте
   * @private
   */
  private textMaxLength = 30;
  /**
   * Контейнер, в котором лежат все эелементы Pixi от текущей Branch
   * @private
   */
  private readonly container: Container;
  /**
   * Соединение с другим блоком (TODO: сделать array)
   */
  public connection: Connection;
  /**
   * Pixi элемент точки, от которой тащить стрелку
   */
  private readonly connectionPoint: Graphics;
  /**
   * Сабджект, чтоб эмитить нажатия на кнопку
   * @private
   */
  private dotClick$ = new Subject<Graphics>();
  /**
   * Сабджект, чтоб эмитить, что отпустили на прямоугольнике, чтоб понимать, что можно закрывать связь
   * @private
   */
  private mouseUp$ = new Subject<Graphics>();
  /**
   * Текстовый блок, вынесен в проперти, чтоб можно было редактировать
   */
  private readonly textNode: Text;

  constructor(innerText: string, options?: BranchOptions) {
    this.textNode = new Text(this.utils.spliceText(innerText), TEXT_STYLE);
    const card = this.createCard(this.textNode);
    this.connectionPoint = this.createConnectionPoint(card);
    this.container = this.createContainer(card, this.connectionPoint);
    this.textNode.x = this.textSideMargin;
    this.textNode.y = (this.container.height - this.textNode.height) / 2;
    this.initDragListeners();
    this.initDotListeners();
  }

  get canvasContainer() {
    return this.container;
  }

  get connectionSource() {
    return this.connectionPoint;
  }

  /**
   * Рисуем прямоугольник, делаем его интерактивным (шлет ивенты на нажатия).
   * buttonMode === cursor: pointer;
   */
  private createCard(textNode: Text): Graphics {
    const rectangle = new Graphics();
    rectangle.lineStyle(1.5, 0xC7CAD1);
    rectangle.beginFill(0xFFFFFF);
    rectangle.drawRoundedRect(0, 0, textNode.width + this.textSideMargin * 2, this.height, 10);
    rectangle.endFill();
    rectangle.interactive = true;
    rectangle.addChild(textNode);
    return rectangle;
  }

  /**
   * Рисуем прямоугольник, делаем его интерактивным (шлет ивенты на нажатия).
   * buttonMode === cursor: pointer;
   * @param wrapper - элемент, на ширину которого нужно ориентироваться при позиционировании кнопки
   */
  private createConnectionPoint(wrapper: Container): Graphics {
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
  }

  /**
   * Создаем блок с текстом и кнопкой для создания связи
   */
  private createContainer(card: Graphics, connectionPoint: Graphics): Container {
    const container = new Container();
    container.interactive = true;
    container.alpha = 0.8;
    container.addChild(card);
    container.addChild(connectionPoint);
    return container;
  }

  /**
   * Прокидывание наружу нажатия на точку, от которой вести стрелку
   * @private
   */
  private initDotListeners() {
    this.connectionPoint.on('pointerdown', (event: MouseEvent) => {
      event.stopPropagation(); // чтоб ивент не прокидывался на полотно и не отрабатывали dragListeners
      this.dotClick$.next(this.connectionPoint);
    });
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

  /**
   * Эвент отпускания ЛКМ поверх карточки обернутый в observable
   */
  get mouseUp() {
    return this.mouseUp$.asObservable();
  }

  /**
   * Эвент нажатия на точку связи обернутый в observable
   */
  get pointClicks() {
    return this.dotClick$.asObservable();
  }

  get utils() {
    return {
      spliceText: (text: string) => {
        return text.length > this.textMaxLength - 3 ? `${text.slice(0, this.textMaxLength)}...` : text;
      }
    };
  }
}
