module.exports = {
  openQRTab: (socket, IP, PORT) => {
    let id = socket.id;
    id = id.replace('/#', '');

    const url = `http://${IP}:${PORT}/qr/${id}`;

    socket.emit('openTab', { url });
  },
  openQRTabInAll: (connections, IP, PORT) => {
    // for (let i = 0; i < connections.length; i++) {
    //   this.openQRTab(connections[i], IP, PORT);
    // }
    for(let key in connections) {
      this.openQRTab(connections[key], IP, PORT);
    }
  },

  // findSocket: (connections, id) => {
  //   for (let i = 0; i < connections.length; i++) {
  //     let socket = connections[i];
  //     if (socket.id === id) return socket;
  //   }

  //   return null;
  // }
}