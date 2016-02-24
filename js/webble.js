'use strict';

//var UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
//var UART_CHAR_RX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
//var UART_CHAR_TX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

// HM-11 Module
var UART_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
var UART_CHAR_RX_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
var UART_CHAR_TX_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';


var connected = false;
var busy = false;
var gattServer;
var driveService;
var writeCharacteristic;
var readCharacteristic;

var USE_WEB_BLUETOOTH = true;
if (navigator.bluetooth == undefined) {
    alert("no bluetooth");
    USE_WEB_BLUETOOTH = false;

}

/**
 * Reset the app variable states.
 */
function resetVariables() {
    connected = false;
    busy = false;
    gattServer = null;
    driveService = null;
    writeCharacteristic = null;
    readCharacteristic = null;
    progress.hidden = true;

}

function handleError(error) {
    console.log("ERROR:" + error);
    resetVariables();
}


/**
 * Send a command to the device.
 *
 * @param bytes The data containing the values.
 * @param offset The data offset within bytes.
 * @return short The data value.
 */
function sendMessage(cmd) {
    if (writeCharacteristic) {
        // Handle one command at a time
        if (busy) {
            // Return if another operation pending
            return Promise.resolve();
        }
        busy = true;
        return writeCharacteristic.writeValue(cmd).then(() => {
            busy = false;
    });
    } else {
        return Promise.resolve();
    }
}


/**
 * Disconnect the device.
 */
function disconnect() {
    console.log('Disconnect');
    //let cmd = new Uint8Array([0x1, 0xd]);
    //sendCommand(cmd).then(() => {
    resetVariables();
    //console.log('Disconnected.');
    //})
    //.catch(handleError);

}

function bleSetup() {
    document.getElementById("connectToggle").addEventListener('click', () => {
        if (gattServer != null && gattServer.connected)
    {
        disconnect();
    }
else
    {
        console.log('Connecting...');
        progress.hidden = false;
        if (readCharacteristic == null) {
            navigator.bluetooth.requestDevice({
                    filters: [{
                        services: [PRIMARY_SERVICE_UUID]
                    }]
                })
                .then(device => {
                console.log('> DEviceNAme=' + device.name);
            console.log('Connecting to GATT Server...');
            return device.connectGATT();
        })
        .
            then(server => {
                console.log('> Found GATT server');
            gattServer = server;
            // Get car service
            return gattServer.getPrimaryService(PRIMARY_SERVICE_UUID);
        })
        .
            then(service => {
                console.log('> Found event service');
            driveService = service;
            // Get write characteristic
            return driveService.getCharacteristic(PRIMARY_CHAR_TX_UUID);
        })
        .
            then(characteristic => {
                console.log('> Found write characteristic');
            writeCharacteristic = characteristic;
            // Get read characteristic
            return driveService.getCharacteristic(PRIMARY_CHAR_RX_UUID);
        })
        .
            then(characteristic => {
                connected = true;
            console.log('> Found read characteristic');
            readCharacteristic = characteristic;
            progress.hidden = true;
            // Listen to device notifications
            return readCharacteristic.startNotifications().then(() => {
                    readCharacteristic.addEventListener('characteristicvaluechanged', event => {
                    console.log('> characteristicvaluechanged = ' + event.target.value + ' [' + event.target.value.byteLength + ']');
            if (event.target.value.byteLength >= 2) {
                let value = new Uint8Array(event.target.value);

            }
        })
            ;
            //setUSerMode();
        })
            ;
        })
        .
            catch(handleError);
        } else {

            progress.hidden = true;
        }
    }
})
    ;

}

////////////////////////////////////////////////////////////////////////////////////


function create_message_from_int16array(array) {
    var arrayLength = array.length;

    var buffer = new ArrayBuffer(arrayLength*2);
    var dataView = new DataView(buffer);
    var uint8View = new Uint8Array(buffer);

    for (var i = 0; i < arrayLength; i++) {
        dataView.setUint16(i*2, array[i],  true) ;
    }
    return uint8View;
}

function create_message_from_int8array(array) {
    var arrayLength = array.length;

    var buffer = new ArrayBuffer(arrayLength*2);
    var dataView = new DataView(buffer);
    var uint8View = new Uint8Array(buffer);

    for (var i = 0; i < arrayLength; i++) {
        dataView.setUint8(i, array[i]) ;
    }
    return uint8View;
}



