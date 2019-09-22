'use strict';

let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');
let terminalContainer = document.getElementById('terminal');
let sendForm = document.getElementById('send-form');
let inputField = document.getElementById('input');

// Подключение к устройству при нажатии на кнопку Connect
connectButton.addEventListener('click', function() {
  connect();
});

// Отключение от устройства при нажатии на кнопку Disconnect
disconnectButton.addEventListener('click', function() {
  disconnect();
});

let readBuffer = '';

function connect() {
  return (deviceCache ? Promise.resolve(deviceCache) :
      requestBluetoothDevice()).
      then(device => connectDeviceAndCacheCharacteristic(device)).
      then(characteristic => startNotifications(characteristic)).
      catch(error => log(error));
}

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');


let options = {filters: [{
  services: [0x2220],
}]};
navigator.bluetooth
  // 1.) Scannen nach dem Bluetoot-Gerät
  .requestDevice(options)
  // 2.) Verbinden zu dem Bluetooth-Gerät
  .then(device => {
    return device.gatt.connect();
  })
  // 3.) Zugriff auf den Service
  .then(server => {
    return server.getPrimaryService(0x2220);
  })
  // 4.) Zugriff auf die Charakteristik
  .then(service => {
    return service.getCharacteristic(0x2221);
  })
  // 5.) Zugriff auf die der Charakteristik hinterlegten Daten
  .then(characteristic => {
    return characteristic.readValue();
  })
  .then(value => {
    // Zugriff auf Wert
  })
  .catch(error => {
    console.error(error);
});
