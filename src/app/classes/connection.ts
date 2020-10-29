import {Branch} from './branch';
import {Container, Graphics, InteractionEvent} from 'pixi.js';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface IPoint {
  x: number;
  y: number;
}

export class Connection extends Graphics {
  /**
   * Создание связи в процессе (клиент тянет стрелку куда-то)
   */
  private drawing = false;
  /**
   * Т.к. при движении курсора линия перерисовывается нужно сохранять старую, чтоб вызвать у нее destroy()
   */
  private prevLine: Graphics;

  public sourceBranch?: Branch;
  public targetBranch?: Branch;

  /**
   * Триггер для rxjs пайпа takeUntil()
   * @private
   */
  private stopDraw$ = new Subject();

  /**
   * @param container контейнер в котором рисовать связь
   * @param geometry наследованый от Graphics параметр
   */
  constructor(private readonly container: Container, geometry?: PIXI.GraphicsGeometry) {
    super(geometry);
    this.listenContainerMouseUp(container);
  }

  /**
   * Добавляем ветку в связь, если есть source, то значит связь "закрываем"
   * @param branch
   */
  public addConnectionSide(branch: Branch) {
    if (!this.sourceBranch) {
      this.sourceBranch = branch;
      this.startDrawing(branch.connectionPoint);
    } else {
      this.targetBranch = branch;
      this.finalizeLine();
    }
  }

  /**
   * Удаляем предыдущую линию, рисуем новую по двум точкам
   * @private
   */
  private drawLine(from: IPoint, to: IPoint) {
    this.prevLine?.destroy();
    const line = new Graphics();
    line.lineStyle(1, 0x000000, 0.7);
    line.moveTo(from.x, from.y);
    line.lineTo(to.x, to.y);
    this.prevLine = line;
    this.container.addChild(line);
  }

  /**
   * Заканчиваем отрисовку, удаляем существу
   */
  public dropConnection() {
    this.stopDrawing();
    this.prevLine?.destroy();
    this.sourceBranch = undefined;
    this.targetBranch = undefined;
  }

  /**
   * Заканчиваем отрисовку, перерисовывам связь с учетом координат двух блоков
   * @private
   */
  private finalizeLine() {
    this.stopDrawing();
    this.sourceBranch.connection = this;
    this.targetBranch.connection = this;

    const sourcePoint: IPoint = {
      x: this.sourceBranch.connectionSourceGlobalCoordinates.x,
      y: this.sourceBranch.connectionSourceGlobalCoordinates.y
    };
    const targetPoint: IPoint = {
      x: this.targetBranch.container.x,
      y: this.targetBranch.container.y + this.targetBranch.container.height / 2
    };
    this.drawLine(sourcePoint, targetPoint);
  }

  /**
   * Начинаем "слушать" движения курсора, на каждый emit перерисовываем
   * @param connectionSource
   * @private
   */
  private startDrawing(connectionSource: Graphics) {
    this.drawing = true;
    fromEvent(connectionSource, 'pointermove')
      .pipe(takeUntil(this.stopDraw$))
      .subscribe((event: InteractionEvent) => {
        const sourcePoint: IPoint = {
          x: this.sourceBranch.connectionSourceGlobalCoordinates.x,
          y: this.sourceBranch.connectionSourceGlobalCoordinates.y
        };
        const targetPoint: IPoint = this.container.toLocal(event.data.global);
        this.drawLine(sourcePoint, targetPoint);
      });
  }

  /**
   * Действия, необходимые при остановки рисования связи по любому сценарию
   * @private
   */
  private stopDrawing() {
    this.drawing = false;
    this.stopDraw$.next();
  }

  private listenContainerMouseUp(container: Container) {
    fromEvent(container, 'pointerup')
      .pipe(takeUntil(this.stopDraw$))
      .subscribe(() => {
        this.dropConnection();
      });
  }
}

