const socketConfig = window.config.socket;
const socket = io(
  `${socketConfig.protocol}${socketConfig.hostname}:${socketConfig.port}`
);
const container = document.querySelector('.container');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const screens = {
  left: document.querySelector('#left'),
  right: document.querySelector('#right'),
};

const Events = {
  CAMERA: 'camera',
  CAPTURE: 'capture',
  CAPTURED: 'captured',
}

const setOrientation = () => {
  if (window.innerHeight > window.innerWidth) {
    container.classList.add('portrait');
  } else {
    container.classList.add('landscape');
  }
};

const setVideo = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
      video: {
        advanced: [{
          facingMode: "environment"
        }]
      }
    }).then(stream => {
      screens.left.src = window.URL.createObjectURL(stream);
      screens.left.play();

      screens.right.src = window.URL.createObjectURL(stream);
      screens.right.play();
    });
  }
}

const captureHandler = () => {
  const interval = setInterval(() => {
    context.drawImage(screens.left, 0, 0, 640, 480);

    const imageData = context.getImageData(0, 0, 640, 480);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      const {
        data
      } = code;

      console.log(data);
      socket.emit(Events.CAPTURED, {
        qr: data
      });

      clearInterval(interval);
    }
  }, 100);
};

const setListeners = () => {
  socket.on(Events.CAPTURE, captureHandler);

  document.body.addEventListener('click', e => {
    socket.emit(Events.CAMERA);
    setVideo();
  }, {
    once: true
  });
}

const initApp = () => {
  setOrientation();
  setListeners();
}
initApp();