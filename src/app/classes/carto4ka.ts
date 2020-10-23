import {Connection} from './connection';
import {Container, Graphics} from 'pixi.js';

export class Carto4ka extends Graphics {
  width = 250;
  height = 150;
  connection: Connection;

  //private carcass: Graphics;
  private connectionPoint: Graphics;

  constructor() {
    super();
    this.drawCarcass();
    //this.fillContainer();
    this.initListeners();
  }

  private fillContainer() {
    //this.drawCarcass();
    //this.connectionPoint = this.drawConnectionPoint();
    //this.addChild(this.carcass);
    //this.addChild(this.connectionPoint);
  }

  private drawCarcass() {
    this.beginFill(0xEDEBF2);
    this.drawRoundedRect(50, 50, this.width, this.height, 10);
    this.endFill();
    this.interactive = true;
    this.buttonMode = true;
  }

  private drawConnectionPoint(): Graphics {
    const circle = new Graphics();
    circle.beginFill(0xDE3249, 1);
    circle.drawCircle(60, 60, 7);
    circle.endFill();
    return circle;
  }

  private initListeners() {
    let data;
    let dragging = false;
    const onDragStart = (event) => {
      this.alpha = 0.7; // opacity
      data = event.data;
      dragging = true;
      event.stopPropagation(); // чтоб ивент перемещения не прокидывался на полотно
    };
    const onDragEnd = () => {
      this.alpha = 1;
      dragging = false;
      data = null;
    };
    const onDragMove = () => {
      if (dragging) {
        const newPosition = data.getLocalPosition(this.parent);
        this.x = newPosition.x - this.width / 1.5;
        this.y = newPosition.y - this.height / 1.5;
      }
    };
    this
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove);
  }
}
