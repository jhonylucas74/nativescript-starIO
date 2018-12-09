import { Observable } from 'tns-core-modules/data/observable';
import { StarIO } from 'nativescript-starIO';

export class HelloWorldModel extends Observable {
  public message: string;
  private starIO: StarIO;

  constructor() {
    super();

    this.starIO = new StarIO();
    this.message = this.starIO.message;
  }
}
