const SocketManager = (() => {
    const sockets = {};
    let cameraSocket;
    let leapControllerSocket;
    let _ID = 1;
    let sourceSocket;
    let destinationSocket;

    return {
      getSockets: () => sockets,
  
      addSocket: socket => {
        sockets[++_ID] = socket;
        return _ID;
      },
      
      removeSocket: function (socket) {
        const id = this.findIdBySocket(socket);
        if (typeof id !== 'undefined') {
          sockets.splice(index, 1);
        }
      },

      setCameraSocket: socket => {
        cameraSocket = socket;
      },
      
      getCameraSocket: () => cameraSocket,

      setLeapControllerSocket: socket => {
        leapControllerSocket = socket;
      },

      setSourceSocket: socket => {
        sourceSocket = socket;
      },

      getSourceSocket: () => sourceSocket,

      setDestinationSocket: socket => {
        destinationSocket = socket
      },

      getDestinationSocket: () => destinationSocket,
      
      findIdBySocket: socket => {
        for (let key in sockets) {
          if(sockets[key].id === socket.id) {
            delete sockets[key];
            break;
          }
        }
      },

      findSocketBySockId: id => {
        for(let key in sockets) {
          if(sockets[key].id === id) {
            return sockets[key]
          };
        }
      }
    }
  })();
  
  module.exports = SocketManager;