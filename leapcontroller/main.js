const output = document.querySelector('#output');
const progress = document.querySelector('#progress');
const start = document.querySelector('#start');

const socketConfig = window.config.socket;
const socket = io(`${socketConfig.protocol}${socketConfig.hostname}:${socketConfig.port}`);

let GRABBING = false;

const Events = {
  GRAB: 'grab',
  LEAPCONTROLLER: 'leapcontroller',
  UNGRAB: 'ungrab'
}

const setListeners = () => {
  start.addEventListener('click', function (E) {
    Leap.loop({
      background: true
    }, {
        hand: hand => {
          const strength = hand.grabStrength.toPrecision(2);

          if (strength >= 0.9 && !GRABBING) {
            GRABBING = true;
            console.log('Grabbed');
            socket.emit(Events.GRAB);
          } else if (strength < 0.1 && GRABBING) {
            GRABBING = false;
            console.log('Ungrab');
            socket.emit(Events.UNGRAB);
          }

          // Update UI
          output.innerHTML = hand.grabStrength.toPrecision(2);
          progress.style.width = hand.grabStrength * 100 + '%';
        }
      })
  }, {
      once: true
    });
}

const initApp = () => {
  socket.emit(Events.LEAPCONTROLLER);
  
  setListeners();
}

initApp();
