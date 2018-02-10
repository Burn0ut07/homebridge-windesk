const request = require('request')
const url = require('url')
const { exec } = require('child_process')
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
        this.name = config['name'];
        this.endpoint = url.parse(`http://${this.hostname}:${this.port}/device`);
        this.wol_cmd = 'wakeonlan ' + config['mac'];
    }

    getServices() {
        let informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "JMF")
            .setCharacteristic(Characteristic.Model, "W10")
            .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

        let switchService = new Service.Switch(this.name);
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
            json: true,
            agent: false,
            timeout: 2000
        },
        function (error, response, body) {
            if (error) {
                me.log('STATUS:', response && response.statusCode);
                me.log('GET Error message:', error.message);

                if (error.code === 'ETIMEDOUT' && error.connect === true) {
                    return next(null, false);
                } else {
                    return next(error);
                }
            }

            return next(null, response.currentState);
        });
    }

    setSwitchOnCharacteristic(on, next) {
        const me = this;

        if (on) {
            exec(me.wol_cmd, (err, stdout, stderr) => {
                if (err) {
                    return next(err);
                }

                me.log(`stdout: ${stdout}`);
                me.log(`stderr: ${stderr}`);
            });

            return next();
        } else {
            request({
                url: me.endpoint,
                body: {'targetState': on},
                method: 'POST',
                json: true,
                agent: false,
                timeout: 2000
            },
            function (error, response) {
                if (error) {
                    me.log('STATUS:', response && response.statusCode);
                    me.log('SET Error message', error.message);
                    return next(error);
                }

                return next();
            });
        }
    }
};
