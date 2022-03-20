<template>
<f7-page name="led">
	<div class="body">
		<div class="statusBar bgGreen"></div>
		<a href="/">
			<div class="backButton">
				<p class="backButtonText">STRONA GŁÓWNA</p>
			</div>
		</a>
		<div class="dhtStatuses bgGreen">
			<div class="dhtStatus bgGreen" :class="screen!='mainScreen' ? '' : 'loaded'">
			<p class="value">{{ temperature }}&deg;</p>
			<p class="title">Temperatura</p>
			</div>
			<div class="dhtStatus bgGreen" :class="screen!='mainScreen' ? '' : 'loaded'">
			<p class="value">{{ humidity }}%</p>
			<p class="title">Wilgotność</p>
			</div>
		</div>
		<img src="../assets/img4.png" class="image" />
		<div v-if="screen!='mainScreen'" id="loadingButton">
			<div @click="ledButtonClick()" class="mainMenuItem" style="margin-top: calc(50% - 20px);">
			<div class="connectionStatus" style="background:none">
				<p class="mainText green">{{
				webSocket.loaded ? "Połączono!" : "Brak połączenia"
				}}</p>
				<p class="statusText green">{{
				webSocket.loading
					? "Łączenie..."
					: webSocket.loaded
					? "Przenoszę do ekranu sterowania"
					: "Dotknij, aby ponowić próbę."
				}}
				</p>
			</div>
			</div>
		</div>
		<div class="ledControl" :class="screen!='mainScreen' ? 'invisible' : 'fadeIn'">
			<div
			class="ledBox"
			:class="fan.turnOn ? 'gray' : 'green'"
			@click="switchLed"
			>
			<p class="ledTitle">WIATRAK</p>
			<p class="ledDescription">{{
				fan.turnOn ? "wyłącz" : "włącz"
			}}</p>
			</div>
			<div class="ledBox white">
			<p class="ledTitle green">{{
				fan.scheduleOff.minutes
			}} min</p>
			<p class="ledDescription green">Do wyłączenia</p>
			</div>
		</div>
		<div class="clear"></div>
		<div id="shineMode" class="shineMode green" :class="screen!='mainScreen' ? 'invisible' : 'fadeIn'" style="margin-bottom:25px;" :style="collapsedSettings ? 'height:30px' : 'height:245px'">
			<div class="scheduleHeader" @click="collapseSettings">
				<a class="ledTitleColor">Ustawienia</a>
				<div>
					<div class="collapseScheduleButton">
						<p class="">{{ collapsedSettings ? "rozwiń" : "zwiń" }}</p>
					</div>
				</div>
			</div>
			<div style="margin-top:5px">
				<div class="sliderWithText" style="margin-top:10px;">
					<p>Włącz wiatrak gdy wilgotność osiągnie - <b>{{fan.runFanHumidity}}%</b></p>
					<input type="range" v-model="fan.runFanHumidity" class="slider" min="0" max="100" step="1"/>
				</div>
				<div class="sliderWithText">
					<p>Wyłącz wiatrak gdy wilgotność osiągnie - <b>{{fan.stopFanHumidity}}%</b></p>
					<input type="range" v-model="fan.stopFanHumidity" class="slider" min="0" max="100" step="1"/>
				</div>
				<div class="sliderWithText">
					<p>Czas po którym wiatrak się wyłączy - <b>{{fan.scheduleOffTime}} min</b></p>
					<input type="range" v-model="fan.scheduleOffTime" class="slider" min="2" max="30" step="1"/>
				</div>
			</div>
			<div class="confirmButton green" @click="saveSettings" style="margin-top:5px">
				<p><b>Zapisz</b></p>
			</div>
		</div>
	</div>
	<!-- <InputColorPicker/> -->
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
			webSocket: {
				loaded: false,
				loading: false,
			},
			fan: {
				settings: false,
				turnOn: true,
				checkLightAuto: false,
				rainbow: false,
				auto: true,
				usingCSData: false,
				color: "#ffffff",
				scheduledDays: [0, 1, 1, 1, 1, 1, 0],
				scheduleOnTime: "06:25",
				scheduleOff:{
					minutes: 5,
					confirmed: false
				},
				shineMode: "default",
				runFanHumidity: 75,
				newRunFanHumidity: 75,
				stopFanHumidity: 63,
				newStopFanHumidity: 63,
				newScheduleOffTime: 10,
				scheduleOffTime: 10
			},
			temperature: "-",
			humidity: "-",
			firstLoad: true,
			collapsedSettings: true,
			screen:"main"
		};
	},
	created: function () {
		var vm = this;

		setTimeout(function(){
			vm.loadWebsocket();
		},100);
	},
	methods: {
		ledButtonClick: function () {
			// mainView.router.navigate('/about/');
			let vm = this;
			!vm.webSocket.loaded && !vm.webSocket.loading
				? vm.loadWebsocket()
				: vm.webSocket.loaded
				? vm.goTo("mainScreen")
				: "";
		},
		collapseOffSchedule: function(){
			const vm = this;
			vm.collapsedOffSchedule = !vm.collapsedOffSchedule;
		},
		collapseSettings: function(){
			const vm = this;
			vm.collapsedSettings = !vm.collapsedSettings;
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
			vm.fan.scheduleOff.confirmed = !vm.fan.scheduleOff.confirmed;
			let settings = {
				minutes: vm.fan.scheduleOff.minutes,
				confirmed: vm.fan.scheduleOff.confirmed
			};
			console.log(JSON.stringify(settings));
			vm.ws.send(JSON.stringify(settings));
		},
		saveSettings: function(){
			const vm = this;
			let settings = {
				runFanHumidity: vm.fan.runFanHumidity,
				stopFanHumidity: vm.fan.stopFanHumidity,
				offTimerTime: vm.fan.scheduleOffTime
			};
			console.log(JSON.stringify(settings));
			vm.collapseSettings();
			vm.ws.send(JSON.stringify(settings));
		},
		switchs: function (param) {
			var vm = this;
			var command = "vm.fan." + param + " = !vm.fan." + param;
			eval(command);
			console.log(command);
		},
		unparseWebsocketMessage: function (message) {
			var vm = this;
			console.log(message);
			var wsObject = JSON.parse(message);
			vm.temperature = wsObject.dhtSensor.temperature;
			vm.humidity = wsObject.dhtSensor.humidity;
			vm.fan.turnOn = wsObject.fanState;
			vm.fan.scheduleOff.confirmed = wsObject.offTimer.status;
			vm.fan.scheduleOff.minutes = wsObject.offTimer.remainingTime;
			vm.fan.runFanHumidity = parseInt(wsObject.settings.runFanHumidity);
			vm.fan.stopFanHumidity = parseInt(wsObject.settings.stopFanHumidity);
			vm.fan.scheduleOffTime = parseInt(wsObject.settings.offTimerTime);
		},
		switchLed: function () {
			var vm = this;
			if (vm.fan.turnOn){
				var command = {
					command: "off"
				}
				vm.fan.turnOn = true;
			}else{
				var command = {
					command: "on"
				}
				vm.fan.turnOn = false;
			} 
			console.log(command);
			vm.ws.send(JSON.stringify(command));
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
					var fadeTarget = document.getElementById("loadingButton").classList.add("fadeOut");
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
				$("#colorpicker").wheelColorPicker('hide');
			};
			app.ws = ws;
		}
	},
	computed:{
		thisDeviceData(){
			const vm = this;
			const list = store.getters.devices.value;

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