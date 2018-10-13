const SocketManager = (() => {
    const sockets = {};
    let cameraSocket = undefined;
    let leapControllerSocket = undefined;
    let _ID = 1;
    let sourceSocket = undefined;
    let destinationSocket = undefined;
    return {
      getSockets: () => ({
        sockets
      }),
  
      addSocket: socket => {
        sockets[++_ID] = socket;
        return _ID;
      },
      
      removeSocket: function (socket) {
        // const index = sockets.indexOf(socket) >= 0;

        // if (index) {
        //   sockets.splice(index, 1);
        // }
        this.findIdBySocket(socket);
      },

      setCameraSocket: socket => {
        cameraSocket = socket;
      },
      
      getCameraSocket: () => cameraSocket,

      setLeapControllerSocket: socket => {
        leapControllerSocket: socket;
      },

      setSourceSocket: (socket) => {
        sourceSocket: socket;
      },

      getSourceSocket: () => sourceSocket,

      setDestinationSocket: socket => {
        destinationSocket: socket
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
      findSocketById: id => {
        for(let key in sockets) {
          if(sockets[key].id === socket.id) {
            return sockets[key]
          };
        }
        return null
      }
    }
  })();
  
  module.exports = SocketManager;