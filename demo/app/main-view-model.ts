import { Observable } from 'tns-core-modules/data/observable';
import { StarIO } from 'nativescript-starIO';

export class HelloWorldModel extends Observable {
  public message: string;
  private starIO: StarIO;

  constructor() {
    super();

    this.starIO = new StarIO();
    this.message = 'waiting'; // this.starIO.message;
    const self = this

    this.starIO.checkStatus('0.0.0.1', '12')
      .then(e => self.message = JSON.stringify(e))
      .catch(e => self.message = 'erro')
  }
}
