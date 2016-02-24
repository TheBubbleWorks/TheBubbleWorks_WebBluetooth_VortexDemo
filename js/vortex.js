

var debug = false;

var CONNECTION_TIMEOUT = 1000;

var CONNECTION_INTERVAL = 1500;

var startTimer;

// TODO: RX, listen notification, when  the Chrom broswr on android supports it.
//             io.on('data', processData);
setTimeout(initVortex, 3000);



/**
 * shorthand for console.dir
 */
function dir(){
	var dataArray = new Array;
	for(var o in arguments) {
	    dataArray.push(arguments[o]);
	}
	if (debug){
		console.log(dataArray);
	}
}

/**
 * shorthand for console.log
 */

function log(){
	var dataArray = new Array;
	for(var o in arguments) {
	    dataArray.push(arguments[o]);
	}
	if (debug){
		console.log(this, dataArray);
	}
}



// command objects. e.g. { "poll", function(){ /*returns pin data*/}}
// command mapping from Scratch
var commands = {
	"reset_all"	: resetAll,
	"move_fw"	: move_fw,				//普通移动 forward
	"move_bk"	: move_bk,				//普通移动 backward
	"move_cw"	: move_cw,				//普通移动 clockwise
	"move_cc"	: move_cc,				//普通移动 counter-clockwise
	"move"		: move,					//普通移动
	"move_stop"	: move_stop,			//停止移动
	"pidline"	: pidline,				//PID辅助直线
	"pll"		: pll,					//pll驱动方式
	"top_led"	: top_led,				//顶部灯盘控制
	"top_led_single": top_led_single,   //单个顶灯控制
	"bottom_led_single": bottom_led_single, //单个底灯控制
	"bottom_led": bottom_led,			//底部灯盘控制
	"face"		: face,					//表情控制
	"musicplay"	: musicplay,			//音乐播放
	"musicstop"	: musicstop,			//音乐停止
	"volume"	: volume,				//设置音量
	"greyscaleswitch"	: greyscaleSwitch,		//灰度自检
	"greythresh": greyscaleThreshold,	//灰度阈值
	"proxcheck"	: proxcheck,			//接近自检
	"init"		: init,					//连接初始化
	"version"	: queryVersion,			//获取版本号
	"dance"		: dance,				//跳舞
	"dance_stop": stopDance,			//停止跳舞
	"when"		: when
};


/**
 * @param {Array} data is request url, the speed is the second element
 */

function move_fw(data){
	_move(data[1], data[1]);
}


function move_bk(data){
	_move(-data[1], -data[1]);
}


function move_cw(data){
	_move(data[1], -data[1]);
}


function move_cc(data){
	_move(-data[1], data[1]);
}


function move(data){
	var left = data[1];
	var right = data[2];
	log(data.toString());
	_move(left, right);
}


function move_stop(){
	_move(0,0);
}


/**
 * Move the wheels
 * @param {number} left  wheel speed, -127 ~ +127
 * @param {number} right wheel speed, -127 ~ +127
 * @param {number} duration time in seconds
 */
function _move(left, right, duration){
	var cmd = commandCode["MOVE"];

	// bound the number from -127 ~ 127
	left	= bound(left,  -127, 127);
	right	= bound(right, -127, 127);

	var leftDirection = left >= 0 ? 1 << 7 : 0;
	var rightDirection = right >= 0 ? 1 << 7: 0;

	var leftSpeed = Math.abs(left);
	var rightSpeed = Math.abs(right);

	duration = duration || 0;
	duration = Math.floor(duration * 1000 / 20); // convert to second to units of 20 milliseconds
	duration = bound(duration, 0, 255);

	sendData([cmd, leftDirection | leftSpeed , rightDirection | rightSpeed, duration]);
}

function when(data){
	return "when 0";
}


/**
 * confine the number within range
 * e.g. bound(-1, 0, 10) = 0
 * bound( 5, 0, 10) = 5
 * bound(15, 0, 10) = 10
 * @param {number} _number input
 * @param {number} _min lower bound
 * @param {number} _max upper bound
 */

function bound(_number, _min, _max){
	return Math.max(Math.min(_number, _max), _min);
}


function pidline(isOn){
	var cmd = commandCode["PIDLINE"];
	sendData([cmd, isOn]);
}


function pll(data){

}


// rex
// 命名规范，如果代码总体没有使用大写，那么添加新函数的时候不要加大写字母
// 虽然No.可以表示number但是在方法名称中过于简短的命名会造成混淆
// 建议修改成top_led_single
function top_led_single(data){
	// rex =======================================
	// 既然ledList实际上只有一个数字，1代表1号灯，那么命名也不应当使用List，而是number或者name
	// 建议改成ledNumber
	var ledNumber = data[1];
 	console.log ("data="+data);

	// rex =======================================
	// 采用左移操作运算简化代码
  // (如果变量ledList重命名为ledNumber的话)改成:
	// address = 0x01 << (ledNumber - 1);

	var address = 0x01 << (ledNumber - 1);
	var color = data[2];
 	_top_led(address, color, data[3]);
 }

function top_led(data){
	var address = 0xFF; // 0b11111110 for all the lights
	var color = data[1];
	_top_led(address, color, data[2]);
}


function _top_led(address, color, duration){
	var cmd = commandCode["TOP_LED"];
	log("Top LED color", color.toString(16));
	_led(cmd, address, color, duration);
}

// rex
// 添加bottom_led_single，底面灯一样可以单个操控

function bottom_led_single(data){
	var ledNumber = data[1];
	var address = 0x01<<(ledNumber-1);
	var color = data[2];
	_bottom_led(address,color,data[3]);
}
function bottom_led(data){
	var address = 0xFF; // 0b11111110 for all the lights
	var color = data[1];
	_bottom_led(address, color, data[2]);
}


function _led(cmd, address, color, duration){

	if (!cmd){
		log("Error: no led command");
		return;
	}

	color = color & 0xFFFFFF;
	var r = (color & 0xFF0000) >> 16;
	var g = (color & 0x00FF00) >> 8;
	var b = (color & 0x0000FF) >> 0;

	duration = duration || 0;
	duration = Math.floor(duration * 1000 / 20)
	duration = bound(duration, 0, 255);

	sendData([cmd, address, r, g, b, duration]);
}

function _bottom_led(address, color, duration){
	var cmd = commandCode["BOTTOM_LED"];
	log("Bottom LED color", color.toString(16));
	_led(cmd, address, color, duration);
}


function bottom_led_off(){
	_bottom_led(0xFF, 0);
}


function top_led_off(){
	_top_led(0xFF, 0);
}


/**
 * Vortex facial expression
 * @param {Array} data
 * data[1] : expression index
 * data[2] : color string @seealso translateColorBit
 */
function face(data){
	var cmd = commandCode["FACE"];

	var expression = data[1];
	expression = bound(expression, 0, 33);

	var color = data[2];
	log(color);
	color = translateColorBit(color);
	log(color);

	sendData([cmd, expression, color]);
}


/**
 * return color bit representation according to vortex protocol
 * the color bit order is red, blue then green from MSB to LSB.
 * @param {string} color string
 */

function translateColorBit(color){
	var colors = {
		"red"	: 0x1 << 2,
		"blue"	: 0x1 << 1,
		"green"	: 0x1,
		"pink"	: 0x1 << 2 | 0x1 << 1,
		"yellow": 0x1 << 2 | 0x1,
		"cyan"	: 0x1 << 1 | 0x1,
		"white"	: 0x1 << 2 | 0x1 << 1 | 0x1,
		"off"	: 0
	};
	return colors[color];
}


function face_off(){
	face([0,0,"off"]);
}

/**
 * Play music
 * @param {Array} data
 * data[1] : music number
 */

function musicplay(data){
	var cmd = commandCode["MUSICPLAY"];
	var music = data[1];
	music = bound(music, 0, 255);
	sendData([cmd, music, 0]);
}


function musicstop(){
	var cmd = commandCode["MUSICSTOP"];
	sendData([cmd]);
}


/**
 * Set music volume, can be called while playing music
 * @param {Array} data
 * data[1] : volume
 */

function volume(data){
	var cmd = commandCode["VOLUME"];
	var volume = data[1];
	volume = bound(volume, 0, 255);
	sendData([cmd, volume]);
}


/**
 * Greyscale sensor switch
 * If turned on, the greyscale sensor will trigger a message sent via serial port
 * @param {Array} data
 * data[1] : "on" or "off"
 */

function greyscaleSwitch(data){
	var cmd = commandCode["GREYSCALE"];
	var isOn = data[1];
	isOn = isOn === "on" ? 1 : 0;
	sendData([cmd, isOn]);
}


/**
 * Set the threshold of the greyscale sensors
 * @param {Array} data
 * data[1] : the threshold
 */

function greyscaleThreshold(data){
	var cmd = commandCode["GREYTHRES"];
	var threshold = data[1];
	threshold = bound(threshold, 0, 255);
	sendData([cmd, threshold]);
}


/**
 * Proximity sensor switch
 * If turned on, the proximity sensor will trigger a message via serial port
 * @param {Array} data
 * data[1] = "on" or "off"
 */

function proxcheck(data){
	var cmd = commandCode["PROXCHECK"];
	var isOn = data[1];
	isOn = isOn === "on" ? 1 : 0;
	sendData([cmd, isOn]);
}


function init(data){
	initVortex();
}


/**
 * Request vortex firmware version
 */
function queryVersion(){
	var cmd = commandCode["VERSION"];
	sendData([cmd], true);
}


function dance(data){
	var cmd = commandCode["DANCE"];
	var theme = data[1];
	theme = bound(theme, 0, 4);
	sendData([cmd, theme]);
}


function stopDance(){
	var cmd = commandCode["DANCE"];
	sendData([cmd, 0xFF]);
}


// command code map sent to Vortex
var commandCode = {
	"MOVE"		: 0x20,	//普通移动
	"PIDLINE"	: 0x21,	//PID辅助直线
	"PLL"		: 0x22,	//PLL驱动方式
	"TOP_LED"	: 0x03,	//顶部灯盘控制
	"BOTTOM_LED": 0x01,	//底部灯盘控制
	"FACE"		: 0x02,	//表情控制
	"MUSICPLAY"	: 0x10,	//音乐播放
	"MUSICSTOP"	: 0x11,	//音乐停止
	"VOLUME"	: 0x12,	//设置音量
	"GREYSCALE"	: 0x33,	//灰度自检
	"GREYTHRES"	: 0x32,	//灰度差值
	"PROXCHECK"	: 0x42,	//接近自检
	"INIT"		: 0x60,	//连接初始化
	"VERSION"	: 0x70,	//获取版本号
	"DANCE"		: 0x40, //跳舞
};


function initVortex(){
	var cmd = commandCode["INIT"];
	sendData([cmd]);
}

// command code map sent from Vortex
var callbackMap = {
	0x31	: greyscaleCallback,	//灰度callBack
	0x41	: proximityCallback,	//距离callback
	0x71	: versionCallback		//版本号Callback
};


/**
 * Receive data from greyscale sensor message
 */

var greyscale = {
	"left"			:0,
	"front_left"	:0,
	"front_right"   :0,
	"right"         :0,
	"back_left"     :0,
	"back_right"    :0
}


function greyscaleCallback(data){
	var positions = data[1].toString();

	for ( var i = 0; i< 6; i += 1){
		if (!positions & (1 << i)){
			continue;
		}
		var position = positions & (1 << i);
		position = greyscalePositions[position];

		if ( !position ) {
			continue;
		}

		log("Greyscale:" + position);
		greyscale[position] = greyscale[position] + 1;
	}
}


var greyscalePositions = {
	1:	"left",
	2:	"front_left",
	4:	"front_right",
	8:	"right",
	16:	"back_left",
	32:	"back_right"
}

/**
 * Receive data from greyscale sensor message
 */

var proximity;
function proximityCallback(data){
	proximity = data[data.length - 1].toString() > 0 ? true: false;
	log("Proximity:" + proximity);
}


/**
 * Receive version data
 */

var version;
function versionCallback(data){
	version = data[1].toString();
	log("version:" + version);
	clearTimeout(checkTimer);
}



/**
 * Dispatch data to their receiver functions
 * The data is dispatched from the serialport, it may not be sent in two byte packets.
 * A buffer must be put in place to hold the command code while the next call processes
 * the content afterwards.
 */

var buffer = [0, 0];
var isReady = false;
function processData(data) {
	isReady = true;
	clearTimeout (startTimer);
	log("raw data:" + data.toString('hex'));

	if (data.length == 1) {
		var firstByte = data[0];

		if ( callbackMap[firstByte] ){
			buffer[0] = firstByte;
		} else {
			buffer[1] = firstByte;
		}
	} else if (data.length >= 2){
		buffer[0] = data[0];
		buffer[1] = data[1];
	}

	log("buff data:" + buffer.toString('hex'));

	var command = buffer[0];
	if (callbackMap[command] && typeof callbackMap[command] === "function"){
		callbackMap[command](buffer);
		// buffer = [0, 0];
	}
}



/**
 * Reset vortex status
 * Stop the music and motors.
 * Turn off top and bottom lights.
 * Turn off facial expression.
 */

function resetAll(){
	move_stop();
	musicstop();
	top_led_off();
	bottom_led_off();
	face_off();
	stopDance();
}

/**
*  check the connection of vortex by interval
*/
var checkTimer;
function heartbeat(){
	setInterval(function(){
		if (isReady) {
		checkTimer = setTimeout(function(){
			log("Error:disconnected!")
			process.exit(1);
		}, CONNECTION_TIMEOUT);
		}
		queryVersion();
	},CONNECTION_INTERVAL);
}

/**
 * Package the raw data with a length header
 * @param {Array} array of hex numbers
 */
function sendData(data, slient){
	if(!slient){
		dir(data);
	}


	// TODO
	// The "\n" is added to workaround the bug with multiple commands
	// especially with "STOP MUSIC" after other commands.
	//io.write(new Buffer(data.concat("\n")));
	// io.write(new Buffer(data));

    sendMessage(create_message_from_int8array(data));

}



/**
 * Send three status variables to the callback function
 */

function reportStatus(callback){

	Object.keys(greyscale).forEach(function(key){
		callback("greyscale/" + key + " " + (greyscale[key] % 2 == 1) + "\n");
		callback("greyscaleCount/" + key + " " + greyscale[key] + "\n");
	});

	callback("proximity " + proximity + "\n");

	callback("version " + version + "\n");
}
