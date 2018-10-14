const socketConfig = window.config.socket;
const socket = io(
  `${socketConfig.protocol}${socketConfig.hostname}:${socketConfig.port}`
);
const container = document.querySelector('.container');
const drop = document.querySelector('#drop');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const screens = {
  left: document.querySelector('#left'),
};

const Events = {
  CAMERA: 'camera',
  CAPTURE: 'capture',
  CAPTURED: 'captured',

  END: 'end',

  GRAB: 'grab',
  LEAPCONTROLLER: 'leapcontroller',
  UNGRAB: 'ungrab',

  MULTIPLE: 'multiple'
};
let QRS_SCANNED = 0;

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
    });
  }

  let GRABBING = false;

  socket.emit(Events.LEAPCONTROLLER);
  screens.left.addEventListener('touchstart', e => {
    if (!GRABBING) {
      GRABBING = true;
      socket.emit(Events.GRAB);
    } else if (GRABBING && e.touches && e.touches.length) {
      socket.emit(Events.MULTIPLE);
    }
  });
  drop.addEventListener('touchstart', e => {
    e && e.preventDefault();
    if (GRABBING) {
      GRABBING = false;
      socket.emit(Events.END);
    }
  });
}

const captureHandler = () => {
  const interval = setInterval(() => {
    context.drawImage(screens.left, 0, 0, 200, 200);

    const imageData = context.getImageData(0, 0, 200, 200);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      const {
        data
      } = code;

      console.log(data);
      socket.emit(Events.CAPTURED, {
        qr: data
      });
      
      if (++QRS_SCANNED >= 2) {
        drop.classList.remove('hidden');
      }

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