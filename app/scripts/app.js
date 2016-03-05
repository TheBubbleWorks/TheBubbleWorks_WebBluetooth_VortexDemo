(function(document) {
    'use strict';

    /**
     * Elements are guartneed to be upgraded and ready at this point.
     * It's safe to poke element properties, call methods, etc.
     *
     * Note: in Chrome (or a browser that natively supports HTML Imports)
     * waiting for this event is not needed. Imports will have already
     * loaded and upgraded elements by the time the bottom of the page
     * is reached. However, waiting for this event consolidates the code
     * paths between native and polyfill.
     */
    document.addEventListener('WebComponentsReady', function(e) {
        console.log('WebComponentsReady!!!');
        onReady();
    });


// ------------------------------------------------------------------------------
// Declarations (no DOM or Polymer interaction, don oafter page lod)

function VortexAPI() {
    var self = this;

    self.init = function() {
        initVortex();
    }

    self.reset = function() {
        resetAll();
    };

    // Shared: the 0's are dummy values ignored by the provided (from DFRobots Snap) vortex.js


    // leftSpeed :   int,    -127 to 127
    // rightSpeed:   int,    -127 to 127
    self.motorSpeeds = function (leftSpeed, rightSpeed) {
        move([0, leftSpeed, rightSpeed]);
    };

    // expression:  int,     1..33
    // colour:      string, [red | blue | green | pink | yellow | cyan | white | off]
    self.setFace = function(expression, colour) {
        face([0, expression+1, colour]);
    };

    self.faceOff = function(expresion, colour) {
        face_off();
    };

    // pattern:     int,    0 - 4
    self.setDance = function(pattern) {
        dance([0, pattern])
    };

    self.danceOff = function() {
        stopDance();
    };
};


// ------------------------------------------------------------------------------
// On Page load

function onReady() {
    var connected = false;
    var leftMotorSpeed=0, rightMotorSpeed=0;
    var vortex = new VortexAPI();

    Polymer({
        is: 'my-app',


        eyeSelected: function(e) {
            console.log(e.model.item);
            vortex.setFace(e.model.item.index, "red");
        },


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

    var connectButton = document.getElementById("connectToggle");
    var resetButton = document.getElementById("send-reset-button");


    connectButton.addEventListener('click', function() {
        console.log("Connecting");

        bluetoothDevice.request().then(function() {
            console.log("Connected");
            connected = true;
            vortex.init();
        }).catch(onError);
    });


    resetButton.addEventListener('click', function() {
        bluetoothDevice.request().then(function(device) {
                bluetooth_connected();
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
        vortex.init();
        setInterval( function() {
            if (connected) {
                vortex.motorSpeeds(leftMotorSpeed, rightMotorSpeed);  // 0x00 is a dummy for vortex.js
                //console.log(new Date().getTime() + ": " + leftMotorSpeed.toFixed(2), rightMotorSpeed.toFixed(2));
            }
        }, 200);
    }


}


})(document);

