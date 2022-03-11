<template>
<f7-page name="led">
	<div class="body">
	<div class="statusBar"></div>
	<a href="/">
		<div>
			<div class="backButton">
			<p class="backButtonText">STRONA GŁÓWNA</p>
			</div>
		</div>
	</a>
	<div class="dhtStatuses">
		<div class="dhtStatus" :class="screen!='mainScreen' ? '' : 'loaded'">
			<p class="value">{{ temperature }}&deg;</p>
			<p class="title">Temperatura</p>
		</div>
		<div class="dhtStatus" :class="screen!='mainScreen' ? '' : 'loaded'">
			<p class="value">{{ humidity }}%</p>
			<p class="title">Wilgotność</p>
		</div>
	</div>
	<img src="../assets/img1.png" class="image" />
	<div v-if="screen!='mainScreen'" id="loadingButton">
		<div @click="ledButtonClick()" class="mainMenuItem" style="margin-top: calc(50% - 20px);">
		<div class="connectionStatus" style="background:none">
			<p class="mainText">{{
			webSocket.loaded ? "Połączono!" : "Brak połączenia"
			}}</p>
			<p class="statusText">{{
			webSocket.loading
				? "Łączenie..."
				: webSocket.loaded
				? "Przenoszę do ekranu głównego"
				: "Dotknij, aby ponowić próbę."
			}}
			</p>
		</div>
		</div>
	</div>
	<div class="ledControl" :class="screen!='mainScreen' ? 'invisible' : 'fadeIn'">
		<div
		class="ledBox"
		:class="light.turnOn ? 'gray' : ''"
		@click="switchLed"
		>
		<p class="ledTitle">LED</p>
		<p class="ledDescription">
			{{
				light.turnOn ? "wyłącz" : "włącz"
			}}
		</p>
		</div>
		<div class="ledBox color" @click="openRGBWheel()">
			<p class="ledTitleColor">Kolor</p>
		<!-- <input id="color" type="color" v-model="light.color" @input="sendRGB" @change="sendRGB"> -->
			<input type="submit" style="display:none;height: 1px;width: 1px;color: transparent;opacity: 0;" v-model="light.color" id="colorpicker" class="colorpicker" data-wcp-format="css"  hideKeyboard="true" data-wheelcolorpicker/>
		<!-- <input type="text" class="colorpicker" data-wheelcolorpicker /> -->
		</div>
	</div>
	<div class="clear"></div>
	<!-- <InputColorPicker/> -->
	
	<div id="offSchedule" class="schedule" :class="screen!='mainScreen' ? 'invisible' : 'fadeIn'" :style="collapsedOffSchedule ? 'height:30px' : 'height:135px'">
		<!-- <v-input-colorpicker/> -->
		<div class="scheduleHeader" @click="collapseOffSchedule">
			<a class="ledTitleColor">Wyłączenie czasowe</a>
			<div>
				<div class="collapseScheduleButton">
					<p class="">{{ collapsedOffSchedule ? "rozwiń" : "zwiń" }}</p>
				</div>
			</div>
		</div>
		<div style="margin-top:5px">
			<div id="ledsOnText" v-if="!light.turnOn" style="text-align: center;margin-top: 35px;">
				Pasek led jest wyłączony
			</div>
			<div v-else>
				<p v-if="!light.scheduleOff.confirmed">Wybierz ilość minut</p>
				<p v-else>Światło zgaśnie w ciągu <b>{{ light.scheduleOff.minutes }} minut</b></p>
				<input type="range" class="slider" v-model="light.scheduleOff.minutes" min="1" max="60" style="margin-top:5px" :disabled="light.scheduleOff.confirmed"/>
				<div class="confirmButton" :class="light.scheduleOff.confirmed ? 'gray' : ''" @click="confirmScheduleOff" style="margin-top:5px">
					<p v-if="!light.scheduleOff.confirmed">Wyłącz światło za <b>{{light.scheduleOff.minutes}}</b> minut</p>
					<p v-else><b>Anuluj zaplanowane wyłączanie</b></p>
				</div>
			</div>
		</div>
	</div>
	
	<div id="shineMode" class="shineMode" :class="screen!='mainScreen' ? 'invisible' : 'fadeIn'" :style="collapsedMode ? 'height:30px' : 'height:190px'">
		<!-- <v-input-colorpicker/> -->
		<div class="scheduleHeader" @click="collapseMode">
			<a class="ledTitleColor">Tryb świecienia</a>
			<div>
				<div class="collapseScheduleButton">
					<p class="">{{ collapsedMode ? "rozwiń" : "zwiń" }}</p>
				</div>
			</div>
		</div>
		<div style="margin-top:5px">
			<div class="shineModeOptions">
				<div class="option" :class="light.shineMode=='default' ? 'selected' : ''" @click="changeMode('default')">Stały</div>
				<div class="option" :class="light.shineMode=='breathing' ? 'selected' : ''" @click="changeMode('breathing')">Oddychanie</div>
				<div class="option" :class="light.shineMode=='fade' ? 'selected' : ''" @click="changeMode('fade')">Tęcza</div>
				<div class="option" :class="light.shineMode=='strobe' ? 'selected' : ''" @click="changeMode('strobe')">Stroboskop</div>
			</div>
			<div class="sliderWithText" style="margin-top:10px;" v-if="light.shineMode=='fade'">
				<p>Prędkość</p>
				<input type="range" class="slider" v-model="mode.speed" min="200" max="5000" step="50" :disabled="light.scheduleOff.confirmed" @input="sendShineModeProperties()"/>
			</div>
			<div class="sliderWithText" style="margin-top:10px;" :class="light.shineMode!='breathing' ? 'gray' : ''" v-else>
				<p>Prędkość</p>
				<input :disabled="light.shineMode!='breathing'" type="range" class="slider" v-model="mode.frequency" min="0.1" max="3" step="0.1" @input="sendShineModeProperties()"/>
			</div>
			<div class="sliderWithText" :class="light.shineMode!='fade' ? 'gray' : ''">
				<p>Jasność</p>
				<input :disabled="light.shineMode!='fade'" type="range" class="slider" v-model="mode.brightness" min="25" max="255" step="10" @input="sendShineModeProperties()"/>
			</div>
		</div>
	</div>
	<div id="moreSettings" class="moreSettings" :class="screen!='mainScreen' ? 'invisible' : 'fadeIn'" :style="collapsedMore ? 'height:30px' : 'height:105px'">
		<!-- <v-input-colorpicker/> -->
		<div class="scheduleHeader" @click="collapseMore">
			<a class="ledTitleColor">Dodatkowe ustawienia</a>
			<div>
				<div class="collapseScheduleButton">
					<p class="">{{ collapsedMore ? "rozwiń" : "zwiń" }}</p>
				</div>
			</div>
		</div>
		<div style="margin-top:5px">
			<div class="option" style="border-radius: 0px;border-bottom: 1px solid;height: 25px;" @click="useCSData">
				<p style="float:left;margin-top:2px">Kolor z gry - CS</p>
				<div class="state" :class="light.usingCSData ? 'gray' : ''">{{ light.usingCSData ? "wyłacz" : "włącz"}}</div>
			</div>
			<div class="option" @click="autoModeToggle">
				<p style="float:left;margin-top:2px">Harmonogram tylko gdy ciemno</p>
				<div class="state" :class="light.checkLightAuto ? 'gray' : ''">{{ light.checkLightAuto ? "włacz" : "włącz" }}</div>
			</div>
		</div>
	</div>
	
	<div id="schedule" class="schedule" :class="screen!='mainScreen' ? 'invisible' : 'fadeIn'" :style="collapsedSchedule ? 'height:30px' : 'height:180px'">
		<!-- <v-input-colorpicker/> -->
		<div class="scheduleHeader">
			<a class="ledTitleColor" @click="collapseSchedule">Harmonogram</a>
			<div @click="switchAuto">
				<div class="scheduleSwitch" :class="light.auto ? 'gray' : ''">
				<p class="scheduleSwitchText">{{ light.auto ? "wyłącz" : "włącz" }}</p>
				</div>
			</div>
			</div>
			<div class="days">
				<div v-for="(day,index) in weekDays" @click="()=>{light.scheduledDays[index]=!light.scheduledDays[index];$forceUpdate()}">
					<div class="day" :class="light.scheduledDays[index]==1 ? '' : 'gray'">
					<p class="dayText" :class="light.scheduledDays[index]==1 ? '' : 'gray'">{{ day }}</p>
					</div>
				</div>
			</div>
			<!-- <div style="clear:both"></div> -->
			<div class="time">
				<div class="hour" style="margin-left:0;border-radius:0px;border-bottom: 1px solid">
					<p style="float:left;">Godzina włączenia</p>
					<input type="time" style="float:right;text-align:right;color: #850035;" v-model="light.scheduleOnTime">
				</div>
				<div class="hour" style="margin-right:0">
					<p style="float:left;">Godzina wyłączenia</p>
					<input type="time" style="float:right;text-align:right;color: #850035;" v-model="light.scheduleOffTime">
				</div>
			</div>
			<div class="confirmButton" @click="saveSettings" style="margin-top:5px">
					<p><b>Zapisz</b></p>
				</div>
		</div>
	</div>
</f7-page>
</template>



<script>
import store from "../js/store.js"

export default {
	props: {
      f7route: Object,
      f7router: Object,
    },
	data() {
		return {
			color: "#ffffff",
			ws: "",
			collapsedOffSchedule: true,
			collapsedSchedule: true,
			collapsedMode: true,
			collapsedMore: true,
			webSocket: {
				loaded: false,
				loading: false,
			},
			stoveWebSocket: {
				loaded: false,
				loading: false,
			},
			weekDays: ["Pn","Wt","Śr","Cz","Pt","Sb","Nd"],
			screen: "main",
			smallView: true,
			temperature: "-",
			humidity: "-",
			motionSensor: true,
			lightSensor: true,
			firstLoad: true,
			light: {
				settings: false,
				turnOn: true,
				checkLightAuto: false,
				rainbow: false,
				auto: true,
				usingCSData: false,
				color: "#ffffff",
				scheduledDays: [0, 1, 1, 1, 1, 1, 0],
				scheduleOnTime: "06:25",
				scheduleOffTime: "06:45",
				scheduleOff:{
					minutes: 5,
					confirmed: false
				},
				shineMode: "default"
			},
			mode: {
				speed: 750,
				brightness: 150,
				frequency: 1
			},
			shineModePropertiesTimeout: ""
		};
	},
	created: function () {
		var vm = this;

		setTimeout(function(){
			vm.loadWebsocket();
			
			$('#colorpicker').on('colorchange', function() {
				vm.light.color = $(this).val();
				if(!vm.firstLoad)
					vm.sendRGB();
			});
		},100)
	},
	methods: {
		sendShineModeProperties: function(){
			var vm = this;
			clearTimeout(vm.shineModePropertiesTimeout);
			vm.shineModePropertiesTimeout = setTimeout(function(){
				let typeObject = {mode:vm.light.shineMode};
				switch(vm.light.shineMode){
					case "fade":
						typeObject.speed = vm.mode.speed;
						typeObject.brightness = vm.mode.brightness;
						break;
					case "breathing":
						typeObject.frequency = vm.mode.frequency;
						break;
				}
				vm.ws.send(JSON.stringify(typeObject));
			},200)
		},
		changeMode:function(mode){
			var vm = this;

			vm.light.shineMode=mode;
			vm.ws.send(JSON.stringify({"mode":mode}));
		},
		useCSData:function(mode){
			var vm = this;

			vm.light.usingCSData =! vm.light.usingCSData;
			vm.ws.send("c");
		},
		autoModeToggle:function(mode){
			var vm = this;

			vm.light.checkLightAuto =! vm.light.checkLightAuto;
			vm.ws.send("b");
		},
		openRGBWheel:function(){
			$("#colorpicker").wheelColorPicker('show');
			$(".jQWCP-overlay").css({display:""});
		},
		collapseOffSchedule: function(){
			const vm = this;
			vm.collapsedOffSchedule = !vm.collapsedOffSchedule;
		},
		collapseSchedule: function(){
			const vm = this;
			vm.collapsedSchedule = !vm.collapsedSchedule;
		},
		collapseMode: function(){
			const vm = this;
			vm.collapsedMode = !vm.collapsedMode;
		},
		collapseMore: function(){
			const vm = this;
			vm.collapsedMore = !vm.collapsedMore;
		},
		confirmScheduleOff: function(){
			const vm = this;
			vm.light.scheduleOff.confirmed = !vm.light.scheduleOff.confirmed;
			let settings = {
				minutes: vm.light.scheduleOff.minutes,
				confirmed: vm.light.scheduleOff.confirmed
			};
			console.log(JSON.stringify(settings));
			vm.ws.send(JSON.stringify(settings));
		},
		switchs: function (param) {
			var vm = this;
			var command = "vm.light." + param + " = !vm.light." + param;
			eval(command);
			console.log(command);
		},
		unparseWebsocketMessage: function (message) {
			var vm = this;
			console.log(message);
			var wsObject = JSON.parse(message);
			vm.temperature = wsObject.dhtSensor.temperature;
			vm.humidity = wsObject.dhtSensor.humidity;
			vm.lightSensor = wsObject.lightSensor;
			vm.motionSensor = wsObject.motionSensor;
			vm.light.turnOn = wsObject.light.turnOn;
			vm.light.scheduleOff.confirmed = wsObject.light.scheduleOffConfirmed;
			vm.light.scheduleOff.minutes = wsObject.light.scheduleOffMinutes || 5;
			vm.light.auto = wsObject.light.autoMode;
			vm.light.usingCSData = wsObject.light.usingCSData;
			vm.light.checkLightAuto = wsObject.light.checkLightAuto;
			var color = "#";
			let red = (parseInt(wsObject.light.color.split(",")[0]) < 16 ? "0" : "") + parseInt(wsObject.light.color.split(",")[0]).toString(16);
			let green = (parseInt(wsObject.light.color.split(",")[1]) < 16 ? "0" : "") + parseInt(wsObject.light.color.split(",")[1]).toString(16);
			let blue = (parseInt(wsObject.light.color.split(",")[2]) < 16 ? "0" : "") + parseInt(wsObject.light.color.split(",")[2]).toString(16);

			color += `${red}${green}${blue}`;
			console.log(color);
			vm.light.color = color;
			vm.light.scheduledDays = wsObject.light.scheduledDays;
			var scheduleOnTime =
				wsObject.light.turnOnTime.split(":")[0] < 10
				? "0" + wsObject.light.turnOnTime.split(":")[0]
				: wsObject.light.turnOnTime.split(":")[0];
			scheduleOnTime += ":";
			scheduleOnTime +=
				wsObject.light.turnOnTime.split(":")[1] < 10
				? "0" + wsObject.light.turnOnTime.split(":")[1]
				: wsObject.light.turnOnTime.split(":")[1];
			vm.light.scheduleOnTime = scheduleOnTime;
			var scheduleOffTime =
				wsObject.light.turnOffTime.split(":")[0] < 10
				? "0" + wsObject.light.turnOffTime.split(":")[0]
				: wsObject.light.turnOffTime.split(":")[0];
			scheduleOffTime += ":";
			scheduleOffTime +=
				wsObject.light.turnOffTime.split(":")[1] < 10
				? "0" + wsObject.light.turnOffTime.split(":")[1]
				: wsObject.light.turnOffTime.split(":")[1];
			vm.light.scheduleOffTime = scheduleOffTime;
			switch(wsObject.light.shineMode){
				case 0:
					vm.light.shineMode = "default";
					break;
				case 1:
					vm.light.shineMode = "fade";
					break;
				case 2:
					vm.light.shineMode = "strobe";
					break;
				case 3:
					vm.light.shineMode = "breathing";
					break;
			}
			if(vm.firstLoad){{
				$(".ledBox.color").css({background:vm.light.color});
				console.log(`${red}${green}${blue}`);
				// $("#colorpicker").wheelColorPicker( 'setRgb', parseInt(red,16), parseInt(green,16), parseInt(blue,16), true );
				$("#colorpicker").wheelColorPicker( 'setValue', vm.light.color);
				vm.firstLoad = false;
			}
			}
		},
		sendRGB: function () {
			var vm = this;
			if (!vm.light.turnOn) vm.light.turnOn = true;
			$(".ledBox.color").css({background:vm.light.color});
			let red = parseInt(vm.light.color.slice(1,3),16);
			let green = parseInt(vm.light.color.slice(3,5),16);
			let blue = parseInt(vm.light.color.slice(5,7),16);
			let colorValue = red + blue + green;
			console.log(colorValue);
			if(colorValue<400 || (red == 0 || blue == 0 || green == 0)){
				document.getElementsByClassName("ledTitleColor")[0].style.color = "#fff";
			}else{
				document.getElementsByClassName("ledTitleColor")[0].style.color = "#850035";
			}
			console.log(vm.light.color);
			vm.ws.send(vm.light.color);
		},
		switchLed: function () {
			var vm = this;
			if (vm.light.turnOn) vm.ws.send("o");
			else vm.ws.send("i");
			vm.light.turnOn = !vm.light.turnOn;
		},
		switchAuto: function () {
			var vm = this;
			vm.light.auto = !vm.light.auto;
			vm.ws.send("a");
		},
		switchCheckLightAuto: function () {
			var vm = this;
			vm.light.checkLightAuto = !vm.light.checkLightAuto;
			vm.ws.send("b");
		},
		saveSettings: function () {
			var vm = this;
			var settings = {
				turnOnHour: parseInt(vm.light.scheduleOnTime.split(":")[0]),
				turnOnMinute: parseInt(vm.light.scheduleOnTime.split(":")[1]),
				turnOffHour: parseInt(vm.light.scheduleOffTime.split(":")[0]),
				turnOffMinute: parseInt(vm.light.scheduleOffTime.split(":")[1]),
				scheduled: vm.light.scheduledDays,
			};
			console.log(JSON.stringify(settings));
			vm.ws.send(JSON.stringify(settings));
		},
		loadWebsocket: function () {
			let app = this;
			console.log(app.screen);
			let ws = app.ws;
			try {
				ws.close();
			} catch (e) {
				// nic nie rób
			}
			console.log("Łączenie z websocketem");
			app.webSocket.loading = true;
			if (app.webSocket.loaded) return;

			WebSocket.pluginOptions = {
				origin: `http://${app.deviceAddress.ip}`,
				maxConnectTime: 5000,
				override: true
			};
			ws = new WebSocket(`ws://${app.deviceAddress.ip}:${app.deviceAddress.port}`);
			ws.onopen = function () {
				app.webSocket.loaded = true;
				app.webSocket.loading = false;
				setTimeout(function () {
					var fadeTarget = $("#loadingButton").addClass("fadeOut");
				},1500)
				let to = setTimeout(function () {
					app.screen = "mainScreen";
				}, 2500);
				ws.send("Message to send");
			};

			ws.onmessage = function (evt) {
				var received_msg = evt.data;
				app.unparseWebsocketMessage(received_msg);
			};

			ws.onerror = function (e) {
				console.log(e);
				// app.loadWebsocket();
			};
			ws.onclose = function () {
				app.webSocket.loaded = false;
				app.screen = "main";
				let to = setTimeout(function () {
					app.webSocket.loading = false;
				}, 2000);
				console.log("Closed connection");
				try{
					$("#colorpicker").wheelColorPicker('hide');
				}catch(e){
					
				}
			};
			app.ws = ws;
		},
		ledButtonClick: function () {
			// mainView.router.navigate('/about/');
			let vm = this;
			!vm.webSocket.loaded && !vm.webSocket.loading
				? vm.loadWebsocket()
				: vm.webSocket.loaded
				? vm.goTo("mainScreen")
				: "";
		},
		stoveButtonClick: function () {
			console.log("x");
			let vm = this;
			!vm.stoveWebSocket.loaded && !vm.stoveWebSocket.loading
				? vm.loadStoveWebsocket()
				: vm.stoveWebSocket.loaded
				? ""
				: "";
		},
		goTo: function (viewName) {
			let vm = this;
			vm.screen = viewName;
		},
		goToMain: function () {
			let vm = this;
			vm.screen = "main";
		},
	},
	computed:{
		thisDeviceData(){
			const vm = this;
			const list = [];
			const list2 = store.getters.devices.value;

			for(let i = 0; i < list2.length ; i++){
				list.push(list2[i])
				console.log(i);
			}

			return list.filter(obj => obj.id == vm.f7route.params.deviceId)
		},
		deviceAddress(){
			const vm = this;
			const address = vm.thisDeviceData[0].ip;
			return {
				ip: address.split(":")[0],
				port: address.split(":")[1] || 81
			}
		}
	}
};
</script>