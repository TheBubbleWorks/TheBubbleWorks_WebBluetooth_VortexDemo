'use strict';

(function(document) {

    document.addEventListener('WebComponentsReady', function(e) {
        onReady();
    });



// ------------------------------------------------------------------------------
// On Page load

function onReady() {
    var connected = false;
    var leftMotorSpeed=0, rightMotorSpeed=0;
    var vortex = new VortexAPI();


    Polymer({
        is: 'my-app',
    });

    var app = document.querySelector('#my-app');

    app.faceSelected = function(e) {
        console.log(e.model.item);
        vortex.setFace(e.model.item.index, "red");
    }


    app.handleInput = function (e) {
        console.log("col change");
    }


    // ------------------------------------------------------------------------------
    // UI Events

    var pages = document.querySelector('iron-pages');
    var tabs = document.querySelector('paper-tabs');
    var danceGroup = document.querySelector('#danceGroup');
    var musicGRoup = document.querySelector('#faceGroup');

    tabs.addEventListener('iron-select', function() {
        pages.selected = tabs.selected;
    });

    danceGroup.addEventListener('iron-select', function() {
        var dance = danceGroup.selected;
        console.log("dance selected:" + dance);
        switch (dance) {
            case "danceOff": vortex.stopDance(); break;
            case "dance1": vortex.startDance(0); break;
            case "dance2": vortex.startDance(1); break;
            case "dance3": vortex.startDance(2); break;
            case "dance4": vortex.startDance(3); break;
            default:    vortex.stopDance();
        }
    });

    musicGroup.addEventListener('iron-select', function() {
        var music = musicGroup.selected;
        console.log("music selected:" + dance);
        switch (dance) {
            case "musicOff": vortex.stopMusic(); break;
            case "music1": vortex.startMusic(0); break;
            case "music2": vortex.startMusic(1); break;
            case "music3": vortex.startMusic(2); break;
            case "music4": vortex.startMusic(3); break;
            default:    vortex.stopMusic();
        }
    });

    var vortexColourPicker = document.querySelector('paper-color-input');

    vortexColourPicker.addEventListener('value-changed', function(){
        var normalizedEvent = Polymer.dom(event);
        //console.info('rootTarget is:', normalizedEvent.rootTarget);
        //console.info('localTarget is:', normalizedEvent.localTarget);
        //console.info('path is:', normalizedEvent.path);
        console.log("Colour: " + event.detail.value);
        console.log(el.value.red, el.value.green, el.value.blue);
    });



    // ------------------------------------------------------------------------------
    // Bluetooth LE (mostly bolierplate)


    var bluetoothDevice = document.querySelector('platinum-bluetooth-device');
    var writeCharacteristic = document.querySelector('platinum-bluetooth-characteristic');

    function _send_array(byteArray) {
        var bytes = new Uint8Array(byteArray);
            if (connected) {
                writeCharacteristic.write(bytes).then(function() {});
            } else {
                console.log("WARN: attempt to send while not connected: " + bytes);
            }
        }
        document.writeArrayToDefaultBLECharacteristic = _send_array;

    var connectButton = document.getElementById("connect-toggle");
    var resetButton = document.getElementById("send-reset-button");


    connectButton.addEventListener('click', function() {
        console.log("Connecting");

        bluetoothDevice.request().then(function() {
            bluetooth_connected();
        }).catch(onError);
    });


    resetButton.addEventListener('click', function() {
        bluetoothDevice.request().then(function(device) {
            vortex.reset();
            })
            .catch(onError);
    });


    function onError(error) {
        console.log("ERROR: " + error);
    }

    // ------------------------------------------------------------------------------
    // Joystick


    var joystick = new RetroJoyStick({
        retroStickElement: document.querySelector('#retrostick')
    });


    joystick.subscribe('change', function(stick)  {

        var y = (Math.cos(stick.angle * (Math.PI / 180))  * stick.distance) / 100;
        var x = (Math.sin(stick.angle * (Math.PI / 180))  * stick.distance) / 100;
        leftMotorSpeed = (y + x) * 127;
        rightMotorSpeed = (y - x) * 127;

        //console.log( new Date().getTime() + ": " +stick.angle, stick.distance + " => " + x, y, ": " +leftMotorSpeed.toFixed(2), rightMotorSpeed.toFixed(2));

    }.bind(this));


    function bluetooth_connected() {
        connected=true;
        vortex.init();

        setInterval( function() {
            console.log(new Date().getTime() + ": " + leftMotorSpeed.toFixed(2), rightMotorSpeed.toFixed(2));

            if (connected) {
                vortex.motorSpeeds(leftMotorSpeed, rightMotorSpeed);
            }
        }, 200);
    }


}

})(document);

