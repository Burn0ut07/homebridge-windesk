const Service, Characteristic;
const request = require('request')
const url = require('url')

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("windesk-plugin", "WindowsDesktopSwitch", windesk);
}

// function windesk(log, config) {
// 	this.log = log;
// 	this.hostname = config['hostname'];
// }

class windesk {
	constructor(log, config) {
		this.log = log;
		this.hostname = config['hostname'];
		this.currentState = false;
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
				.on('get', this.setSwitchOnCharacteristic.bind(this));

		this.informationService = informationService;
		this.switchService = switchService;
		return [informationService, switchService];
	}

	getSwitchOnCharacteristic(next) {
		const me = this;
		me.log('State: ' + me.state)
		return next(null, state);
	}

	setSwitchOnCharacteristic(on, next) {
		const me = this;
		me.log("On: " + on);
		me.state = !me.state;
		return next();
	}
};