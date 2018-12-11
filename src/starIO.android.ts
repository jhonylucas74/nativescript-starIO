import { Observable } from 'tns-core-modules/data/observable';
const application = require("application");
import * as dialogs from 'tns-core-modules/ui/dialogs';

const Thread = java.lang.Thread;

declare let com: any;
const StarIOPort: any = com.starmicronics.stario.StarIOPort;
const StarIoExt: any  = com.starmicronics.starioextension.StarIoExt;
const Emulation: any  = com.starmicronics.starioextension.StarIoExt.Emulation;
const CutPaperAction: any = com.starmicronics.starioextension.ICommandBuilder.CutPaperAction;

const Paint: any    = android.graphics.Paint;
const Bitmap: any   = android.graphics.Bitmap;
const Canvas: any   = android.graphics.Canvas;
const Typeface: any = android.graphics.Typeface;
const Color: any    = android.graphics.Color;
const TextPaint: any = android.text.TextPaint;
const Layout: any = android.text.Layout;
const StaticLayout: any = android.text.StaticLayout;
const Base64: any = android.util.Base64;
const BitmapFactory: any =  android.graphics.BitmapFactory;


export class StarIO extends Observable {
  public checkStatus(portName: string, portSettings: string) {
    return new Promise((resolve, reject) => {
      let port = null;
  
      try {
        var context = application.android.context;
        port = StarIOPort.getPort(portName, portSettings, 10000, context);
  
        try {
          Thread.sleep(500);
        } catch (e) {
          // Thread error
          return reject(e);
        }
  
        const status = port.retreiveStatus();
        const data = {
          offline: status.offline,
          coverOpen: status.coverOpen,
          cutterError: status.cutterError,
          receiptPaperEmpty: status.receiptPaperEmpty
        };
  
        resolve(data);
        try {
          StarIOPort.releasePort(port);
        } catch(e) {
          // Failed to release printer
          reject(e);
        }
        
      } catch (e) {
        // Failed to connect to printer
        reject(e);
      }
    });
  }

  printReceipt(params) {
    return new Promise((resolve, reject) => {
      const { portName}  = params;
      const portSettings = getPortSettingsOption(portName);
      sendCommand(portName, portSettings, params, resolve, reject);
    })
}

  

  public portDiscovery(strInterface) {
    return new Promise((resolve, reject) => {
      let  result = null;

      try {
          if (strInterface == "LAN") {
              result = getPortDiscovery("LAN");
          } else if (strInterface == "Bluetooth") {
              result = getPortDiscovery("Bluetooth");
          } else if (strInterface == "USB") {
              result = getPortDiscovery("USB");
          } else {
              result = getPortDiscovery("All");
          }

      } catch (e) {
        reject(e)
      }

      resolve(result)
    })
  }
}


export class Builder extends Observable {
  commands = []
  paperWidth: number;

  constructor(options) {
    super();
    
    if(!options) options = {};
    this.paperWidth = options.width || 384;
  }


  error (str) {
    throw new Error(str);
  }

  text (input, style) {
    const _style   = style          || {};
    _style.size    = _style.size    || 15;
    _style.color   = _style.color   || 'black';
    _style.font    = _style.font    || 'default';
    _style.weight  = _style.weight  || 'normal';
    _style.align   = _style.align   || 'normal';
    _style.bgcolor = _style.bgcolor || 'white';

    const text = input ? input : ''; 

    this.commands.push({
      type: 'text',
      text: text,
      style: _style
    });

    return this;
  };

  image (input, style) {
    const _style   = style        || {};
    _style.align   = _style.align   || 'center';
    _style.width   = _style.width   || 350;

    this.commands.push({
      type: 'image',
      image: input,
      align: _style.align,
      width: _style.width
    });

    return this;
  }
  
  openCashDrawer () {
    this.commands.push({ type: 'opencash' });
    return this;
  }

  cutPaper () {
    this.commands.push({ type: 'cutpaper' });
    return this;
  }

  print (port) {
    const args = [{
      paperWidth: this.paperWidth,
      port: port,
      commands: this.commands
    }];

    const starIOPlugin = new StarIO()
    return starIOPlugin.printReceipt(args);
  }
}


function getPortDiscovery(interfaceName: string) {
  let BTPortList = null;
  let TCPPortList = null;
  let USBPortList = null;

  const context = application.android.context;
  const arrayDiscovery = []
  const arrayPorts = [];


  if (interfaceName == "Bluetooth" || interfaceName == "All") {
      BTPortList = StarIOPort.searchPrinter("BT:");
      BTPortList.forEach(portInfo => arrayDiscovery.push(portInfo));
  }

  if (interfaceName == "LAN" || interfaceName == "All") {
      TCPPortList = StarIOPort.searchPrinter("TCP:");
      TCPPortList.forEach(portInfo => arrayDiscovery.push(portInfo));
  }

  if (interfaceName == "USB" || interfaceName == "All") {
      USBPortList = StarIOPort.searchPrinter("USB:", context);
      USBPortList.forEach(portInfo => arrayDiscovery.push(portInfo))
  }

  arrayDiscovery.forEach(discovery => {
    const port: any = {};
    port.name = discovery.getPortName();

    if (discovery.getMacAddress() != "") {
        port.macAddress = discovery.getMacAddress();

        if (discovery.getModelName() != "") {
            port.modelName = discovery.getModelName();
        }

    } else if (interfaceName == "USB" || interfaceName == "All") {
        if (discovery.getModelName() != "") {
            port.modelName = discovery.getModelName();
        }
        if (discovery.getUSBSerialNumber() != " SN:") {
            port.USBSerialNumber = discovery.getUSBSerialNumber();
        }
    }

    arrayPorts.push(port);
  })

  return arrayPorts;
}

function getPortSettingsOption(portName) {
  let portSettings = "";

  if (/^TCP\:/.test(portName.toUpperCase())) {
    portSettings += ""; // retry to yes
  } else if (/^BT\:/.test(portName.toUpperCase())) {
    portSettings += ";p"; // or ";p"
    portSettings += ";l"; // standard
  }

  return portSettings;
}


function sendCommand(portName: string, portSettings: string, params: any, resolve, reject) {
  let port = null;
  const context = application.android.context;

  try {
      port = StarIOPort.getPort(portName, portSettings, 10000, context);

      try {
        Thread.sleep(100);
      } catch (e) {
        return reject(e)
      }

      let status = port.beginCheckedBlock();

      if (status.offline) {
        return reject("printerOffline: Printer is offline before start the process.");
      }

      const commandToSendToPrinter = createCommands(params);

      port.writePort(commandToSendToPrinter, 0, commandToSendToPrinter.length);

      port.setEndCheckedBlockTimeoutMillis(30000);// Change the timeout time of endCheckedBlock method.
      status = port.endCheckedBlock();

      if (status.coverOpen == true) {
          return reject("printerCoverOpen");
      } else if (status.receiptPaperEmpty == true) {
        return reject("printerPaperEmpty");
      } else if (status.offline == true) {
        return reject("printerOffline: Printer is offline after try print comands.")
      }
  } catch (e) {
    return reject(e);
  }

  try {
    StarIOPort.releasePort(port);
  } catch (e) {
    return reject("ImpossibleReleasePort");
  }

  return resolve("Printed");
}
  

function createCommands(params) {
  const builder = StarIoExt.createCommandBuilder(Emulation.StarGraphic);
  builder.beginDocument();

  const { commands, paperWidth } = params;
  const widthPaper = paperWidth;

  for (let i = 0; i < commands.length(); i++) {
      let command = commands[i];
      let type = command.type;

      if (type == "text") {
        createText(builder, command, widthPaper);
      }
      else if (type == "cutpaper") {
        cutPaper(builder);
      }
      else if (type == "image") {
        createImage(builder, command, widthPaper);
      }
      else if(type == "opencash") {
        openCashDrawer(builder);
      }
  }

  builder.endDocument();
  return builder.getCommands();
}

function createText(builder, command, width) {
  const textToPrint = command.text;
  const style = command.style;

  const paint = new Paint();
  paint.setStyle(Paint.Style.FILL);
  paint.setColor(Color.BLACK);
  paint.setAntiAlias(false);

  let family = Typeface.DEFAULT;
  const font = style.font;

  if(font == "monospace") {
    family = Typeface.MONOSPACE;
  }
  else if (font == "sans serife") {
    family = Typeface.SANS_SERIF;
  }
  else if (font == "serife") {
    family = Typeface.SERIF;
  }

  let weightInt = Typeface.NORMAL;
  const weight = style.weight;

  if(weight == "bold") {
    weightInt = Typeface.BOLD;
  }
  else if (weight == "bold italic") {
    weightInt = Typeface.BOLD_ITALIC;
  }
  else if (weight == "italic") {
    weightInt = Typeface.ITALIC;
  }

  const typeface = Typeface.create(family, weightInt);
  paint.setTypeface(typeface);

  const size = style.size;
  paint.setTextSize(size * 2);

  const textpaint = new TextPaint(paint);
  const paperWidth = width;

  let align = Layout.Alignment.ALIGN_NORMAL;
  const alignString = style.align;
  if (alignString == "center"){
    align = Layout.Alignment.ALIGN_CENTER;
  }
  else if (alignString == "opposite"){
    align = Layout.Alignment.ALIGN_OPPOSITE;
  }

  const staticLayout = new StaticLayout(textToPrint, textpaint, paperWidth, align, 1, 0, false);
  const height = staticLayout.getHeight();

  const bitmap = Bitmap.createBitmap(staticLayout.getWidth(), height, Bitmap.Config.RGB_565);
  const c = new Canvas(bitmap);
  c.drawColor(Color.WHITE);
  c.translate(0, 0);
  staticLayout.draw(c);

  builder.appendBitmap(bitmap, true);
}

function cutPaper(builder){
  builder.appendCutPaper(CutPaperAction.PartialCutWithFeed);
}

function createImage(builder, command, width) {
  const encodedImage = command.image;

  // const align = command.align;
  const bitmapWidth = command.width;

  const decodedString = Base64.decode(encodedImage, Base64.DEFAULT);
  const decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

  const bitInCenter = centerBitmap(decodedByte, bitmapWidth, width);
  builder.appendBitmap(bitInCenter, true);
}

function centerBitmap(Src, bitmapWidth, width) {
  const outputimage = Bitmap.createBitmap(width, Src.getHeight(), Bitmap.Config.RGB_565);
  const can = new Canvas(outputimage);
  can.drawColor(Color.WHITE);
  can.drawBitmap(Src, (can.getWidth()/2-(Src.getWidth()/2)), 0, null);
  return outputimage;
}

function openCashDrawer(builder) {
  builder.appendRaw(new java.lang.Byte(0x07));
}