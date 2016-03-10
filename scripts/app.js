'use strict';

(function(document) {

    document.addEventListener('WebComponentsReady', function(e) {
        startApp();
    });



    // ------------------------------------------------------------------------------
    // On Page load

    function startApp() {
        var leftMotorSpeed=0, rightMotorSpeed=0;

        Polymer({
            is: 'my-app',
        });

        var app = document.querySelector('#my-app');

        //app.faceSelected = function(e) {
        //    console.log(e.model.item);
        //    vortex.setFace(e.model.item.index+1, "red");
        //}


        // ------------------------------------------------------------------------------
        // UI Events

        // Tabs & Pages

        var pages = document.querySelector('iron-pages');
        var tabs = document.querySelector('paper-tabs');

        tabs.addEventListener('iron-select', function() {
            pages.selected = tabs.selected;
        });


        // Face Change

        document.querySelector('#face-slider').addEventListener('change', function(event) {
            vortex.setFace(event.target.value);
        });


        var faceColourGroup = document.querySelector('#face-colour-group');
        faceColourGroup.addEventListener('iron-select', function() {
            var colour = faceColourGroup.selected;
            console.log("FAce colour selected:" + colour);
            vortex.setFaceColour(colour);
        });


        // Dance Group

        var danceGroup = document.querySelector('#dance-group');
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


        // Music Group

        var musicGroup = document.querySelector('#music-group');
        musicGroup.addEventListener('iron-select', function() {
            var music = musicGroup.selected;
            console.log("music selected:" + music);
            switch (music) {
                case "musicOff": vortex.stopMusic(); break;
                case "music1": vortex.startMusic(0); break;
                case "music2": vortex.startMusic(1); break;
                case "music3": vortex.startMusic(2); break;
                case "music4": vortex.startMusic(3); break;
                default:    vortex.stopMusic();
            }
        });


        // Colour Selectors

        var vortexColourPicker = document.querySelector('#vortex-colour');
        vortexColourPicker.addEventListener('value-changed', function(){
            var normalizedEvent = Polymer.dom(event);
            //console.info('rootTarget is:', normalizedEvent.rootTarget);
            //console.info('localTarget is:', normalizedEvent.localTarget);
            //console.info('path is:', normalizedEvent.path);
            console.log("Colour: " + event.detail.value);
            console.log(vortexColourPicker.value.red, vortexColourPicker.value.green, vortexColourPicker.value.blue);
        });





        // ------------------------------------------------------------------------------
        // Bluetooth LE (mostly bolierplate)

        var bluetoothDevice = document.querySelector('platinum-bluetooth-device');
        var bluetoothWriteCharacteristic = document.querySelector('platinum-bluetooth-characteristic');
        var bluetoothReadCharacteristic = document.querySelector('platinum-bluetooth-characteristic');

        var vortex = new Vortex(bluetoothDevice, bluetoothWriteCharacteristic, bluetoothReadCharacteristic);

        document.vortex = vortex; // current workaround to give legacy Vortex JS access.


        var connectButton = document.getElementById("connect-toggle");
        connectButton.addEventListener('click', function() {
            console.log("Connecting");

            bluetoothDevice.request().then(function(device) {
                //console.log(device);
                vortex.onConnect(device);
            }).catch(onError);
        });


        var resetButton = document.getElementById("send-reset-button");
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                bluetoothDevice.request().then(function () {
                    vortex.reset();
                }).catch(onError);
            });
        }

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



        setInterval( function() {
            if (vortex.isConnected()) {
                    vortex.setMotorSpeeds(leftMotorSpeed, rightMotorSpeed);
                    console.log(new Date().getTime() + ": " + leftMotorSpeed.toFixed(2), rightMotorSpeed.toFixed(2));
                }
        }, 200);

    }

})(document);

