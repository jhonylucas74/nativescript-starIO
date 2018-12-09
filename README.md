# Star Micronics StarIO Nativescript plugin
For Star Micronics bluetooth/LAN printers. It works only with Android.


How to use :

## API

### Import the plugin

```js
import { StarIO, Builder } from 'nativescript-starIO'; 
```

### Printer discovery
```js
// Create a new builder
const stario = new StarIO();

stario.portDiscovery('All')
  .then(list => {
    // all discovery devices
  })
  .catch(error => {
    // error
  })
```
Port types are: 'All', 'Bluetooth', 'USB', 'LAN'

### Printer status
```js
const stario = new StarIO();

stario.checkStatus(portName)
  .then(status => {
      // status result
  })
  .catch(error => {
      // error
  })
```

# Print receipt
## Builder

You need use the ``Builder`` to create the commands pipeline.

To print a receipt you need create a builder with this code:
```js
  const builder = new Builder({ width: 384 });
```

The width represent the paper width. With the instance of builder is possible now add commands.

```js
  builder.text("Hello world", {});
```
In example a text command was added in pipeline. the second argument is a object that represent a style of text. Below follow all the possible values.

* ``size``  : ``int`` | size of text.
* ``font``  : ``string`` |  font family: ``monospace``, ``sans serife``, ``serife`` or ``default``.
* ``weight``  : ``string`` | weight of text: ``bold``, ``bold italic``, ``italic`` or ``normal``.
* ``align``  : ``string`` | align of text: ``center``, ``opposite`` or ``normal``.

Example with default configuration of style.

```js
  builder.text("Hello world", {
    size: 15,
    font: 'default',
    weight: 'normal',
    align: 'normal',
  });
```

Full example with 3 lines:

```js
  const builder = new Builder({ width: 384 })
     .text("Hello world", {})
     .text("This is a example", {})
     .text("Say, good bye!", {})
     .cutPaper();

  builder.print(portName)
    .then(sucess => {
        // sucess
    })
    .catch(error => {
        // error
    })
```

Example with shared style:


```js
  var myStyle = {
    size: 23,
    weight: 'bold',
    align: 'center'
  };

  const builder = new Builder({ width: 384 })
     .text("Title in center", myStyle)
     .text("I'm center too", myStyle)
     .text("all is center", myStyle)
     .cutPaper();
    
  builder.print(portName)
    .then(sucess => {
        // sucess
    })
    .catch(error => {
        // error
    })
```

### Other functions

### Image
Add a image to builder. The first input must be a base64 encoded image. 
```js
  builder.image('data:image/jpg;base64, ....');
```

The second param is optional, but you can change the width anda the align when pass a style.

```js
  builder.image('data:image/jpg;base64, ....', {
    align: 'center'
  });
```

Style image options: 
* ``width``  : ``int`` | size of image.
* ``align``  : ``string`` | align of image: ``center``, ``left`` or ``right``.

### Cutpaper
Cut the paper.
```js
  builder.cutPaper();
```
### Open Cash Drawer
I'm not sure if this work with TSP100.
```js
  builder.openCashDrawer();
```

### print

Finally for print, just call ``print`` command. This function will return a promise.
```js
builder.print(portName);
```