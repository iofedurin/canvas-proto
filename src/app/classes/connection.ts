import {Carto4ka} from './carto4ka';
import {Graphics} from 'pixi.js';

export interface IPoint {
  x: number;
  y: number;
}

export class Connection extends Graphics {
  first: Carto4ka;
  second: Carto4ka;

  constructor(geometry?: PIXI.GraphicsGeometry) {
    super(geometry);
  }

  switchDirection() {}

  remove() {}
}
