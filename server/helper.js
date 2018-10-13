const config = require('./config');
const socketConfig = config.socket;
const Events = require('./events');

module.exports = {
  openQRTab: (id, socket) => {
    const url = `${socketConfig.protocol}://${socketConfig.hostname}:${
      socketConfig.port
    }/qr/${id}`;

    socket.emit(Events.CHROME_EXTENSION.OPEN_QR_TAB, {
      url
    });
  },

  closeQRTab: (id, socket) => {
    socket.emit(Events.CHROME_EXTENSION.CLOSE_QR_TAB);
  },

  openQRTabInAll: function (connections) {
    for (let key in connections) {
      this.openQRTab(key, connections[key]);
    }
  },

  closeQRTabInAll: function (connections) {
    for (let key in connections) {
      this.closeQRTab(key, connections[key]);
    }
  }
};