const fs = require('fs');
const config = require('./config');
const STATIC_FILES = [
  '/js/jquery.min.js',
  '/js/qrcode.min.js',
];
const URL_REGEX = /^\/qr\/[.]*/i;
const handler = (req, res) => {
  const {
    url
  } = req;

  // For static files
  if (STATIC_FILES.indexOf(url) >= 0) {
    fs.readFile(__dirname + `/html${url}`, function(err, data) {
      if (!err) {
        res.writeHead(299);
        res.end(data);
      } else {
        console.log(err);
      }
    });
  }
  // QR Code URL
  else if (URL_REGEX.test(url)) {
    const id = req.url.replace('/qr/', '').replace('/', '');

    res.setHeader('Content-Type', 'text/html');
    res.write(`<!DOCTYPE html><html><head><title></title><style type="text/css">html, body {height: 100%;width: 100%;}body {display: flex;justify-content: center;flex-direction: column;align-content: center;}</style></head><body><div id="qrcode" style="margin: 0 auto"></div><script src="/js/jquery.min.js"></script><script src="/js/qrcode.min.js"></script><script type="text/javascript">var qrcode = new QRCode("qrcode", {    text: "${id}",    width: 500,    height: 500,    colorDark : "#000000",    colorLight : "#ffffff",    correctLevel : QRCode.CorrectLevel.H});</script></body></html>`);
    res.end();
  }
  // Everything else
  else {
    res.end('yo');
  }
};

const app = require(config.socket.protocol).createServer(handler);
const SocketManager = require('./socket-manager');
const helper = require('./helper');
const io = require('socket.io')(app);
const Events = require('./events');

app.listen(config.socket.port);

let GRABBING = false;
let SOURCE_URL = '';

io.on('connection', (socket) => {

  // SocketManager.addSocket(socket);

  socket.on('disconnect', () => {
    SocketManager.removeSocket(socket);
  });

  socket.on(Events.CAMERA.CAMERA, () => {
    console.log('Setting camera');
    SocketManager.setCameraSocket(socket);
  });

  socket.on(Events.LEAPCONTROLLER.LEAPCONTROLLER, () => {
    console.log('Setting leapcontoller');
    SocketManager.setLeapControllerSocket(socket);
  });

  socket.on(Events.CHROME_EXTENSION.CLIENT, () => {
    console.log('Adding a client.');
    SocketManager.addSocket(socket);
  });

  socket.on(Events.LEAPCONTROLLER.GRAB, () => {
    console.log('Got a grab event.');

    if(SocketManager.getCameraSocket() && GRABBING) {
      setTimeout(() => {
        SocketManager.getCameraSocket().emit(Events.CAMERA.CAPTURE, {});
      }, 3000);
      helper.openQRTabInAll(SocketManager.getSockets());
      GRABBING = true;
    }
  });

  socket.on(Events.LEAPCONTROLLER.UNGRAB, () => {
    console.log('Got a ungrab event.');

    if (SocketManager.getCameraSocket() && GRABBING) {
      SocketManager.getCameraSocket().emit(Events.CAMERA.CAPTURE, {});
      GRABBING = false;
    }
  });

  socket.on(Events.CAMERA.CAPTURED, data => {
    const {
      qr: socketId
    } = data;

    let socket = SocketManager.findSocketById(socketId);

    if (!socket) {
      console.log('grabResponse: found socket is null');
      return;
    }

    if (!SOURCE_URL) {
      SocketManager.getSourceSocket().emit(Events.CHROME_EXTENSION.GET_URL, {});  
    } else {
      SocketManager.setDestinationSocket(socket);

      helper.closeQRTabInAll(socketId, SocketManager.getSockets());

      SocketManager.getDestinationSocket().emit(Events.CHROME_EXTENSION.OPEN_URL, { url: SOURCE_URL });

      // Set source URL to empty to indicate new session.
      SOURCE_URL = '';
    }
  })

  socket.on('gotURL', (data) => {
    SOURCE_URL = data.url;
  });
});

console.log('Server Started..');