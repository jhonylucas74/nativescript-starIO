import { Observable } from 'tns-core-modules/data/observable';
import { StarIO, Builder } from 'nativescript-starIO';

export class HelloWorldModel extends Observable {
  public message: string;
  private starIO: StarIO;

  constructor() {
    super();

    this.starIO = new StarIO();
    this.message = 'waiting'; // this.starIO.message;
    const self = this

    this.starIO.portDiscovery('All')
    .then(list => {
        console.log(JSON.stringify(list));
    })
    .catch(error => {
      console.log('\nDiscovery Error: \n'+error);
    })

    /*this.starIO.checkStatus('0.0.0.0:45')
      .then(status => {
        try {
          console.log('\n' + JSON.stringify(status))
        } catch (e) {
          console.log('\n'+status)
        }
      })
      .catch(error => {
        console.log('\nCheck Status Error: \n'+error);
      })*/
    
    const builder = new Builder({ width: 384 })
        .text("Hello world", {})
        .text("This is a right text", {
          size: 14,
          align: 'right'
        })
        .text("Good bye centered,bold,23!", {
          size: 23,
          weight: 'bold',
          align: 'center'
        })
        .cutPaper();

        builder.print('0.0.0.0.:40')
        .then(success => {
          console.log('\nPrint Success: \n'+success);
        })
        .catch(error => {
          console.log('\nPrint Error: \n'+error);
        });
  }
}
