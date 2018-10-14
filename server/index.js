const fs = require('fs');
const config = require('./config');
const SocketManager = require('./socket-manager');
const helper = require('./helper');
const Events = require('./events');

const STATIC_FILES = [
  '/js/jquery.min.js',
  '/js/qrcode.min.js',
];
const URL_REGEX = /^\/qr\/[.]*/i;

// Handler for requests.
const handler = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

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
const io = require('socket.io')(app);

app.listen(config.socket.port);

let GRABBING = false; // Whether or not already grabbing.
let SOURCE_URL = ''; // URL fo the source tab.

io.on('connection', (socket) => {
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

    if(SocketManager.getCameraSocket() && !GRABBING) {
      GRABBING = true;
      SocketManager.clearDestinationSockets();

      // Open QR codes and ask the camera app to parse.
      helper.openQRTabInAll(SocketManager.getSockets());
      SocketManager.getCameraSocket().emit(Events.CAMERA.CAPTURE, {});
    }
  });

  socket.on(Events.LEAPCONTROLLER.UNGRAB, () => {
    console.log('Got a ungrab event.');

    if (SocketManager.getCameraSocket() && GRABBING) {
      GRABBING = false;

      // Open QR codes and ask the camera app to parse.
      helper.openQRTabInAll(SocketManager.getSockets());
      SocketManager.getCameraSocket().emit(Events.CAMERA.CAPTURE, {});
    }
  });

  socket.on(Events.LEAPCONTROLLER.MULTIPLE, () => {
    // Open QR codes and ask the camera app to parse.
    helper.openQRTabInAll(SocketManager.getSockets());
    SocketManager.getCameraSocket().emit(Events.CAMERA.CAPTURE, {});
  });

  const open = () => setTimeout(() => {
    const destinationSockets = SocketManager.getDestinationSockets();
    const url = SOURCE_URL;

    // Set source URL to empty to indicate new session.
    SOURCE_URL = '';

    for (key in destinationSockets) {
      const s = destinationSockets[key]

      s.emit(Events.CHROME_EXTENSION.OPEN_URL, {
        url
      });
    }

  }, 500);

  socket.on(Events.LEAPCONTROLLER.END, () => {
    if (SocketManager.getCameraSocket() && GRABBING) {
      GRABBING = false;
      open();
    }
  });

  socket.on(Events.CAMERA.CAPTURED, data => {
    const {
      qr: socketId
    } = data;

    console.log('QR parsed.', socketId);

    let socket = SocketManager.getSockets()[socketId];

    if (!socket) {
      console.log('grabResponse: found socket is null');
      return;
    }

    helper.closeQRTabInAll(SocketManager.getSockets());

    if (!SOURCE_URL) {
      console.log('This is the source.');
      SocketManager.setSourceSocket(socket);
      socket.emit(Events.CHROME_EXTENSION.GET_URL, {});
    } else {
      console.log('This is the destination.');

      SocketManager.addDestinationSocket(socket);

      if (!GRABBING) {
        open();
      }
    }
  })

  socket.on(Events.CHROME_EXTENSION.GOT_URL, (data) => {
    SOURCE_URL = data.url;
    console.log('Got URL', SOURCE_URL);
  });
});

console.log('Server Started..');