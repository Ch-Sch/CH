(function() {
  'use strict';

  class HeartRateSensor {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
    }
    connect() {
      return navigator.bluetooth.requestDevice({filters:[{services:[0x2220]}]})
      .then(device => {
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return Promise.all([
          server.getPrimaryService(0x2220).then(service => {
            return Promise.all([
              //this._cacheCharacteristic(service, 'body_sensor_location'),
              this._cacheCharacteristic(service, 0x2221),
            ])
          })
        ]);
      })
    }

    /* Heart Rate Service */

   /* getBodySensorLocation() {
      return this._readCharacteristicValue('body_sensor_location')
      .then(data => {
        let sensorLocation = data.getUint8(0);
        switch (sensorLocation) {
          case 0: return 'Other';
          case 1: return 'Chest';
          case 2: return 'Wrist';
          case 3: return 'Finger';
          case 4: return 'Hand';
          case 5: return 'Ear Lobe';
          case 6: return 'Foot';
          default: return 'Unknown';
        }
     });
    } */
    startNotificationsHeartRateMeasurement() {
      return this._startNotifications(0x2221);
    }
    stopNotificationsHeartRateMeasurement() {
      return this._stopNotifications(0x2221);
    }
    parseHeartRate(value) {
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let flags = value.getUint8(0);
      let rate16Bits = flags & 0x1;
      let result = {};
      let index = 1;
      if (rate16Bits) {
        result.heartRate = value.getUint16(index, /*littleEndian=*/true);
        index += 2;
      } else {
        result.heartRate = value.getUint8(index);
        index += 1;
      }
      let contactDetected = flags & 0x2;
      let contactSensorPresent = flags & 0x4;
      if (contactSensorPresent) {
        result.contactDetected = !!contactDetected;
      }
      let energyPresent = flags & 0x8;
      if (energyPresent) {
        result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
        index += 2;
      }
      let rrIntervalPresent = flags & 0x10;
      if (rrIntervalPresent) {
        let rrIntervals = [];
        for (; index + 1 < value.byteLength; index += 2) {
          rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
        }
        result.rrIntervals = rrIntervals;
      }
      return result;
    }

    /* Utils */

    _cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        this._characteristics.set(characteristicUuid, characteristic);
      });
    }
    _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }
    _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.writeValue(value);
    }
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.startNotifications()
      .then(() => characteristic);
    }
    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      .then(() => characteristic);
    }
  }

  window.heartRateSensor = new HeartRateSensor();

})();
