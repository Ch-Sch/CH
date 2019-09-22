// Verknüfpung UI
let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');
let terminalContainer = document.getElementById('terminal');
let sendForm = document.getElementById('send-form');
let inputField = document.getElementById('input');

connectButton.addEventListener('click', function() {
  connect();
});

disconnectButton.addEventListener('click', function() {
  disconnect();
});

// Sendeformular
//sendForm.addEventListener('submit', function(event) {
 // event.preventDefault(); // Предотвратить отправку формы
  //send(inputField.value); // Отправить содержимое текстового поля
  //inputField.value = '';  // Обнулить текстовое поле
  //inputField.focus();     // Вернуть фокус на текстовое поле
//});
    
//let deviceCache = null;

//let characteristicCache = null;

// Zwischenpuffer
//let readBuffer = '';

function connect() {
  return (deviceCache ? Promise.resolve(deviceCache) :
      requestBluetoothDevice()).
      then(device => connectDeviceAndCacheCharacteristic(device)).
      then(characteristic => startNotifications(characteristic)).
      catch(error => log(error));
}

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');
  
  
 navigator.bluetooth.requestDevice({ filters: [{ services: [0x2220] }] })
.then(device => device.gatt.connect())
.then(server => server.getPrimaryService(0x2220))
.then(service => service.getCharacteristic(0x2221'))
.then(characteristic => characteristic.getDescriptor('gatt.characteristic_user_description'))
.then(descriptor => descriptor.readValue())
.then(value => {
  let decoder = new TextDecoder('utf-8');
  console.log('User Description: ' + decoder.decode(value));
})
.catch(error => { console.log(error); });
  
  

//  return navigator.bluetooth.requestDevice({
//    filters: [{services: [0x2220]}],
//  }).
//      then(device => {
//        log('"' + device.name + '" bluetooth device selected');
//        deviceCache = device;
//        deviceCache.addEventListener('gattserverdisconnected',
//            handleDisconnection);

//        return deviceCache;
//      });
//}

function handleDisconnection(event) {
  let device = event.target;

  log('"' + device.name +
      '" bluetooth device disconnected, trying to reconnect...');

//  connectDeviceAndCacheCharacteristic(device).
  //    then(characteristic => startNotifications(characteristic)).
    //  catch(error => log(error));
//}

//function connectDeviceAndCacheCharacteristic(device) {
  //if (device.gatt.connected && characteristicCache) {
    //return Promise.resolve(characteristicCache);
  //}

  //log('Connecting to GATT server...');

  //return device.gatt.connect().
    //  then(server => {
      //  log('GATT server connected, getting service...');

        //return server.getPrimaryService(0x2220);
      //}).
      //then(service => {
        //log('Service found, getting characteristic...');

        //return service.getCharacteristic(0x2221);
      //}).
   // 5.) Zugriff auf die der Charakteristik hinterlegten Daten
      //then(characteristic => {
      //return characteristic.readValue();
      //}).
      //then(value => {
    // Zugriff auf Wert
       }).
    //catch(error => {
    //console.error(error);
//});
    
//}  


//function startNotifications(characteristic) {
  //log('Starting notifications...');

  //return characteristic.startNotifications().
    //  then(() => {
      //  log('Notifications started');
        //characteristic.addEventListener('characteristicvaluechanged',
          //  handleCharacteristicValueChanged);
      //});
//}

function handleCharacteristicValueChanged(event) {
  let value = new TextDecoder().decode(event.target.value);

  for (let c of value) {
    if (c === '\n') {
      let data = readBuffer.trim();
      readBuffer = '';

      if (data) {
        receive(data);
      }
    }
    else {
      readBuffer += c;
    }
  }
}

function receive(data) {
  log(data, 'in');
}

function log(data, type = '') {
  terminalContainer.insertAdjacentHTML('beforeend',
      '<div' + (type ? ' class="' + type + '"' : '') + '>' + data + '</div>');
}

function disconnect() {
  if (deviceCache) {
    log('Disconnecting from "' + deviceCache.name + '" bluetooth device...');
    deviceCache.removeEventListener('gattserverdisconnected',
        handleDisconnection);

    if (deviceCache.gatt.connected) {
      deviceCache.gatt.disconnect();
      log('"' + deviceCache.name + '" bluetooth device disconnected');
    }
    else {
      log('"' + deviceCache.name +
          '" bluetooth device is already disconnected');
    }
  }

  if (characteristicCache) {
    characteristicCache.removeEventListener('characteristicvaluechanged',
        handleCharacteristicValueChanged);
    characteristicCache = null;
  }

  deviceCache = null;
}

function send(data) {
  data = String(data);

  if (!data || !characteristicCache) {
    return;
  }

  data += '\n';

  if (data.length > 20) {
    let chunks = data.match(/(.|[\r\n]){1,20}/g);

    writeToCharacteristic(characteristicCache, chunks[0]);

    for (let i = 1; i < chunks.length; i++) {
      setTimeout(() => {
        writeToCharacteristic(characteristicCache, chunks[i]);
      }, i * 100);
    }
  }
  else {
    writeToCharacteristic(characteristicCache, data);
  }

  log(data, 'out');
}

function writeToCharacteristic(characteristic, data) {
  characteristic.writeValue(new TextEncoder().encode(data));
}
