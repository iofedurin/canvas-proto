import {Branch} from './branch';
import {random} from 'faker';
import {Viewport} from 'pixi-viewport';
import {Application, Sprite, Texture} from 'pixi.js';
import {Connection} from './connection';

export class BotCanvas {
  /**
   * Мейн аппка Pixi, ответственна за канвас
   * @private
   */
  private readonly pixiApp: Application;
  /**
   * Viewport-либа, ответственна за зум и двигание полотна. По факту все рисуется имеено в ней,
   * а она уже лежит в Pixi-канвасе
   * @private
   */
  private readonly viewport: Viewport;
  /**
   * Рисующаяся связь, присутствует с момента нажатия на connectionSource ветки до отпускания ЛКМ на ветке
   * @private
   */
  private processingConnection?: Connection;

  constructor(wrapElement: HTMLElement) {
    this.pixiApp = this.createPixiApp(wrapElement);
    this.viewport = this.createPixiViewport(this.pixiApp);

    // static rectangle to see if viewport moving
    const sprite = this.viewport.addChild(new Sprite(Texture.WHITE));
    sprite.tint = 0xff0000;
    sprite.width = sprite.height = 20;
    sprite.position.set(100, 100);
  }

  /**
   * Рисуем контейнер ветки, "слушаем" нажатия на точку создания связи и момент,
   * когда отпускаешь ЛКМ поверх ветки (для того чтоб закрыть связь)
   */
  addBranch() {
    const newBranch = new Branch(random.words(3));
    this.viewport.addChild(newBranch.container);
    newBranch.pointClicks
      .subscribe(branch => {
        this.processingConnection = new Connection(this.viewport);
        this.processingConnection.addConnectionSide(branch);
      });
    newBranch.mouseUp
      .subscribe(branch => {
        if (this.processingConnection?.sourceBranch) {
          this.processingConnection.addConnectionSide(branch);
          this.processingConnection = undefined;
        }
      });
  }

  private createPixiApp(wrapElement: HTMLElement): Application {
    const app = new Application({
      backgroundColor: 0xFFFFFF,
      resizeTo: wrapElement
    });
    wrapElement.appendChild(app.view);
    return app;
  }

  private createPixiViewport(pixiApp: Application): Viewport {
    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 1000,
      worldHeight: 1000,
      interaction: pixiApp.renderer.plugins.interaction
    });
    viewport.drag().wheel();
    pixiApp.stage.addChild(viewport);
    return viewport;
  }
}
