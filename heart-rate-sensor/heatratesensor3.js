function onButtonClick() {
  let serviceUuid = document.querySelector('#service').value;
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = document.querySelector('#characteristic').value;
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({filters: [{services: [0x2220]}]})
  .then(device => {
    log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    log('Getting Service...');
    return server.getPrimaryService(0x2220);
  })
  .then(service => {
    log('Getting Characteristics...');
    if (characteristicUuid) {
      // Get all characteristics that match this UUID.
      return service.getCharacteristics(0x2221);
    }
    // Get all characteristics.
    return service.getCharacteristics();
  })
  .then(characteristics => {
    log('> Characteristics: ' +
      characteristics.map(c => c.uuid).join('\n' + ' '.repeat(19)));
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}
