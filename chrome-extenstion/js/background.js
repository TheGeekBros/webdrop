const config = {
	socket: {
		protocol: 'https://',
		hostname: 'localhost',
		port: 8000
	}
};

const socketConfig = config.socket;
const socket = io(`${socketConfig.protocol}${socketConfig.hostname}:${socketConfig.port}`);

const Events = {
	CLIENT: 'client',
	CLOSE_QR_TAB: 'close_qr_tab',
	GET_URL: 'get_url',
	GOT_URL: 'got_url',
	OPEN_QR_TAB: 'open_qr_tab',
	OPEN_URL: 'open_url',
}

let OPENED = false;
let ACTIVE_TAB;
let QR_TAB;

const setSocketHandlers = () => {
	socket.on(Events.OPEN_QR_TAB, data => {
		const {
			url
		} = data;

		chrome.tabs.getSelected(null, tab => {
			ACTIVE_TAB = tab;
		
			if (!OPENED) {
				chrome.tabs.create({
					url,
					active: true
				}, tab => {
					QR_TAB = tab;
					OPENED = true;
					
					chrome.tabs.onRemoved.addListener((id, removeInfo) => {
						if (id === QR_TAB.id) {
							OPENED = false;
						}
					});;
				});
			}

		});		
	});

	socket.on(Events.CLOSE_QR_TAB, () => {
		const {
			id
		} = QR_TAB;
		
		try {
			chrome.tabs.remove(id, x => {
				OPENED = false;

				if (ACTIVE_TAB.id > 0) {
					chrome.tabs.update(ACTIVE_TAB.id, {
						active: true
					}, () => {});
				}
			});
		} catch (err) {}
	});

	socket.on(Events.OPEN_URL, data => {
		const {
			url
		} = data;

		chrome.tabs.create({
			url,
			active: true
		}, tab => {});
	});

	socket.on(Events.GET_URL, () => {
		const {
			url
		} = ACTIVE_TAB;

		socket.emit(Events.GOT_URL, {
			url
		});
	});
}

const initApp = () => {
	socket.emit(Events.CLIENT);

	setSocketHandlers();
}

initApp();
