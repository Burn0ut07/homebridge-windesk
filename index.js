const request = require('request')
const url = require('url')
var Service, Characteristic;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("windesk-plugin", "WindowsDesktopSwitch", windesk);
}

class windesk {
	constructor(log, config) {
		this.log = log;
		this.hostname = config['hostname'];
		this.port = config['port'];
		this.endpoint = url.parse("http://" + this.hostname + ":" + this.port + "/device");
	}

	getServices() {
		let informationService = new Service.AccessoryInformation();
		informationService
			.setCharacteristic(Characteristic.Manufacturer, "JMF")
			.setCharacteristic(Characteristic.Model, "W10")
			.setCharacteristic(Characteristic.SerialNumber, "123-456-789");

		let switchService = new Service.Switch("Windesk Switch");
		switchService
			.getCharacteristic(Characteristic.On)
				.on('get', this.getSwitchOnCharacteristic.bind(this))
				.on('set', this.setSwitchOnCharacteristic.bind(this));

		this.informationService = informationService;
		this.switchService = switchService;
		return [informationService, switchService];
	}

	getSwitchOnCharacteristic(next) {
		const me = this;

		request({
			url: me.endpoint,
			method: 'GET',
		},
		function (error, response, body) {
			if (error) {
				me.log('STATUS: ' + response.statusCode);
				me.log(error.message);
				return next(error);
			}

			me.log('State: ' + me.currentState);

			return next(null, body.currentState);
		});
	}

	setSwitchOnCharacteristic(on, next) {
		const me = this;

		request({
			url: me.endpoint,
			body: {'targetState': on},
			method: 'POST',
			headers: {'Content-type': 'application/json'}
		},
		function (error, response) {
			if (error) {
				me.log('STATUS: ' + response.statusCode);
				me.log(error.message);
				return next(error);
			}

			me.log("On: " + on);

			return next();
		});
	}
};
