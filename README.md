# WebDrop

WebDrop allows you to transfer webpages between computers, using just your phone. You'll feel like [Tony Stark](https://youtu.be/1BWknkKJ-Dk?t=209).

Also, [LeapDrop](https://github.com/thegeekbros/leapdrop) on steroids.

# Parts

- Chrome Extension (`chrome-extension`)
- Node.js Server (`server`)
- Web app running on the phone (`phone`)
- LeapMotion communicator (`leapcontroller`) - We've pivoted from this, but it should be supported.

# Setup

1. Set protocol, hostname, and port for your Node.js server in `server/config.js`, `phone/config.js`, `chrome-extension/js/background.js`. We'd recommend using it over HTTPS, because we need to access the camera from the phone, which is only allowed over HTTPS. You'd have to reverse-proxy using (chrome://inspect)[chrome://inspect] from the same machine as your Node.js server to run it otherwise.

### Server

1. `cd server`
2. `npm i`
3. `npm run start`

### Chrome Extension

1. Open the Extension Management page by navigating to [`chrome://extensions`](chrome://extensions).
    - The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions.
2. Enable Developer Mode by clicking the toggle switch next to Developer mode.
3. Click the LOAD UNPACKED button and select the extension directory (`chrome-extension`).

Note: You'll need to reload your Chrome Extension every time your server restarts.

### Phone

1. `cd phone`
2. `python -m SimpleHTTPServer` - A static file-server will be running on port 8000. Open this web page from a phone.

# Usage

1. Open the webpage on your phone. Tap anywhere on the page to start the camera.
2. While pointing at a computer you'd like to select as source (with Chrome open), tap the camera area on the webpage on your phone. Wait for the QR code to appear and disappear.
3. For all the computers that you'd like to select as destinations, do the same thing again - point at the computer, tap the camera area on the webpage on your phone, and wait for the QR code to appear and disappear.
4. When ready to open the webpages on those devices, press the "Open" button.