const PORT = 3000;
const IP = '127.0.0.1';
const io = require('socket.io')(app);
const SocketManager = require('./socket-manager');
const helper = require('./helper');
const handler = (req, res) => {

};

const app = require('http').createServer(handler);

app.listen(PORT);

let grabbing = false;
let sourceURL = '';

io.on('connection', (socket) => {

  // SocketManager.addSocket(socket);

  socket.on('disconnect', () => {
    SocketManager.removeSocket(socket);
  });

  socket.on('cameraConnection', () => {
    SocketManager.setCameraSocket(socket);
  });

  socket.on('leapControllerConnection', () => {
    SocketManager.setLeapControllerSocket(socket);
  });

  socket.on('client', () => {
    SocketManager.addSocket(socket);
  });

  socket.on('grab', async () => {
    if(SocketManager.getCameraSocket() && grabbing) {
      setTimeout(() => {
        SocketManager.getCameraSocket().emit('source', {});
      }, 3000); 
      // await SocketManager.getCameraSocket.emit('source', {});
      helper.openQRTabInAll(SocketManager.getSockets(), IP, PORT);
      grabbing = true;
    }
  });

  socket.on('ungrab', () => {
    if (SocketManager.getCameraSocket() && grabbing) {
      SocketManager.getCameraSocket().emit('destination', {});
      grabbing = false;
    }
  });

  socket.on('grabResponse', (data) => {
    let id = `/#${data}`;

    let socket = SocketManager.findSocketById(id);
    if(!socket) {
      console.log('grabResponse: found socket is null');
      return;
    }

    SocketManager.getSourceSocket().emit('getURL', {});
  });

  socket.on('gotURL', (data) => {
    sourceURL = data.url;
  });

  socket.on('ungrabResponse', (data) => {
    const id = `/#${id}`;
    const socket = SocketManager.findSocketById(id);
    if (!socket) {
      return;
    }

    SocketManager.setDestinationSocket(socket);

    helper.closeQRTabInAll(SocketManager.getSockets(), IP, PORT);

    SocketManager.getDestinationSocket().emit('openURL', { url: sourceURL });
  })

});

console.log('Server Started..');