(function(document) {
    'use strict';

    document.addEventListener('WebComponentsReady', function(e) {
        onReady();
    });



// ------------------------------------------------------------------------------
// On Page load

function onReady() {
    var connected = false;
    var leftMotorSpeed=0, rightMotorSpeed=0;
    var vortex = new VortexAPI();


    function colorChanged() {
        console.log("colourChange");
    }

    Polymer({
        is: 'my-app',

        eyeSelected: function (e) {
            console.log(e.model.item);
            vortex.setFace(e.model.item.index, "red");
        },

        properties: {
            owner: {

                ownerChanged: function () {
                    console.log("ownerChanged");
                }
            }
        }
    });

    // ------------------------------------------------------------------------------
    // UI Events

    var pages = document.querySelector('iron-pages');
    var tabs = document.querySelector('paper-tabs');
    var danceMoves = document.querySelector('paper-radio-group');

    tabs.addEventListener('iron-select', function() {
        pages.selected = tabs.selected;
    });

    danceMoves.addEventListener('iron-select', function() {
        var dance = danceMoves.selected;
        console.log("dance selected:" + dance);
        switch (dance) {
            case "danceOff": vortex.danceOff(); break;
            case "dance1": vortex.setDance(0); break;
            case "dance2": vortex.setDance(1); break;
            case "dance3": vortex.setDance(2); break;
            case "dance4": vortex.setDance(3); break;
            default:    vortex.danceOff();
        }
    });

    var el = document.querySelector('paper-color-input');

    el.addEventListener('value', function(){
        var normalizedEvent = Polymer.dom(event);
        console.info('rootTarget is:', normalizedEvent.rootTarget);
        console.info('localTarget is:', normalizedEvent.localTarget);
        console.info('path is:', normalizedEvent.path);
    });



    // ------------------------------------------------------------------------------
    // Bluetooth LE (largley bolierplate)


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


    let joystick = new RetroJoyStick({
        retroStickElement: document.querySelector('#retrostick')
    });

    joystick.subscribe('change', stick => {

        var y = (Math.cos(stick.angle * (Math.PI / 180))  * stick.distance) / 100;
    var x = (Math.sin(stick.angle * (Math.PI / 180))  * stick.distance) / 100;
    leftMotorSpeed = (y + x) * 127;
    rightMotorSpeed = (y - x) * 127;

    //console.log( new Date().getTime() + ": " +stick.angle, stick.distance + " => " + x, y, ": " +leftMotorSpeed.toFixed(2), rightMotorSpeed.toFixed(2));

});


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

