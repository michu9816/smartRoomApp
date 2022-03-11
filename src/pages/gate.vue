<template>
	<f7-page name="home">
		<a href="/">
			<div @click="goToMain()" v-show="loggedIn">
				<div class="backButton">
				<p class="backButtonText">STRONA GŁÓWNA</p>
				</div>
			</div>
		</a>
		<div class="headerRed">
			<p class="value">
				BRAMA {{ thisDeviceData.name }}
			</p>
			<p class="description">
				{{ !loggedIn ? 
					(wrongPin ? 
						"PODANO ZŁY PIN" :
						"WPISZ PIN") : 
					(webSocket.loading ?
						"ŁĄCZENIE ..." :
						gate.moving ? 
							"W RUCHU ..." :
							gate.closed ? 
							"ZAMKNIĘTA" :
							"OTWARTA") }}
			</p>
		</div>
		<img src="../assets/img1.png">
		<div class="menuBg">
			<div class="menu">
				<div class="menuItem" v-for="item in menuItems" :key="item" @click="changeTab(item.tab)" :class="selectedTab==item.tab ? 'selected' : ''">
					{{ item.name }}
				</div>
			</div>
		</div>
		
		<div class="clear"></div>

		<div class="pinpad" v-show="!loggedIn">
			<div class="pin">
				<div class="number" v-for="number in 4" :key="number">
					{{ pin[number - 1] }}
				</div>
			</div>
			<div class="tvButtonRow" v-for="row in 3" :key="row">
				<div class="tvButton" v-for="button in 3" :key="button" @click="pinAdd((row - 1) * 3 + button)">
					{{ (row - 1) * 3 + button }}
				</div>
			</div>
			<div class="tvButtonRow">
				<div class="tvButton" @click="resetPin()">
					C
				</div>
				<div class="tvButton" @click="pinAdd(0)">
					0
				</div>
				<a href="/">
					<div class="tvButton" @click="goToMain()">
						EXIT
					</div>
				</a>
			</div>
		</div>
		<div v-show="loggedIn && screen!='mainScreen'" id="loadingButton">
			<div @click="gateButtonClick()" class="mainMenuItem" style="margin-top: calc(50% - 20px);">
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
		<div class="gateControl"  :class="loggedIn && screen=='mainScreen' ? 'fadeIn' : 'invisible'">
			<div
				class="gateBox"
				:class="gate.isClosing ? 'gray' : ''"
				@click="closeGate()"
				>
				<p class="ledTitle">{{ gate.isClosing ? "ZATRZYMAJ" : "ZAMKNIJ" }}</p>
				<p class="ledDescription">
					bramę
				</p>
			</div>
			<div
				class="gateBox"
				:class="gate.isOpening ? 'gray' : ''"
				@click="openGate()"
				>
				<p class="ledTitle">{{ gate.isOpening ? "ZATRZYMAJ" : "OTWÓRZ" }}</p>
				<p class="ledDescription">
					bramę
				</p>
			</div>
		</div>

		<div class="clear"></div>
		<div class="limit"  :class="loggedIn && screen=='mainScreen' ? 'fadeIn' : 'invisible'">
			<div class="switch" :class="{ inactive:!gate.closed }">
				Krańcówka <br> zamknięcia<br><b> {{ gate.closed ? "Aktywna" : "Nieaktywna" }}</b>
			</div>
			<div class="switch" :class="{ inactive:!gate.colision }">
				Kurtyna<br><b>{{ gate.colision ? "Aktywna" : "Nieaktywna" }}</b>
			</div>
			<div class="switch" :class="{ inactive:!gate.opened }">
				Krańcówka otwarcia<br><b>{{ gate.opened ? "Aktywna" : "Nieaktywna" }}</b>
			</div>
		</div>
		<div id="offSchedule" class="schedule" :class="loggedIn && screen=='mainScreen' ? 'fadeIn' : 'invisible'" :style="collapsedOffSchedule ? 'height:30px' : 'height:135px'">
			<div class="scheduleHeader" @click="collapseOffSchedule">
				<a class="ledTitleColor">Zamknięcie czasowe</a>
				<div>
					<div class="collapseScheduleButton">
						<p class="">{{ collapsedOffSchedule ? "rozwiń" : "zwiń" }}</p>
					</div>
				</div>
			</div>
			<div style="margin-top:5px">
				<div id="ledsOnText" v-if="gate.closed" style="text-align: center;margin-top: 35px;">
					Brama jest już zamknięta
				</div>
				<div v-else>
					<p v-if="!gate.scheduleOff.confirmed">Wybierz ilość minut</p>
					<p v-else>Brama zamknie się w ciągu<b>{{ gate.scheduleOff.minutes }} minut</b></p>
					<input type="range" class="slider" v-model="gate.scheduleOff.minutes" min="1" max="60" style="margin-top:5px" :disabled="gate.scheduleOff.confirmed"/>
					<div class="confirmButton" :class="gate.scheduleOff.confirmed ? 'gray' : ''" @click="confirmScheduleOff" style="margin-top:5px">
						<p v-if="!gate.scheduleOff.confirmed">Zamknij bramę za <b>{{gate.scheduleOff.minutes}}</b> minut</p>
						<p v-else><b>Anuluj zaplanowane wyłączanie</b></p>
					</div>
				</div>
			</div>
		</div>
		<div id="settings" class="moreSettings" :class="loggedIn && screen=='mainScreen' ? 'fadeIn' : 'invisible'" :style="collapsedSettings ? 'height:30px' : 'height:105px'">
			<div class="scheduleHeader" @click="collapseSettings">
				<a class="ledTitleColor">Ustawienia</a>
				<div>
					<div class="collapseScheduleButton">
						<p class="">{{ collapsedSettings ? "rozwiń" : "zwiń" }}</p>
					</div>
				</div>
			</div>
			<div class="option" style="border-radius: 0px;border-bottom: 1px solid;height: 25px;">
				<p style="float:left;margin-top:2px">Krańcówka otwarcia</p>
				<div class="state" :class="gate.settings.lowerLimitType == 'nc' ? 'gray' : ''" @click="changeLimitType(1,'nc')">NC</div>
				<div class="state" :class="gate.settings.lowerLimitType == 'no' ? 'gray' : ''" @click="changeLimitType(1,'no')">NO</div>
			</div>
			<div class="clear"></div>
			<div class="option" style="border-radius: 0px;height: 25px;">
				<p style="float:left;margin-top:2px">Krańcówka zamknięcia</p>
				<div class="state" :class="gate.settings.upperLimitType == 'nc' ? 'gray' : ''" @click="changeLimitType(0,'nc')">NC</div>
				<div class="state" :class="gate.settings.upperLimitType == 'no' ? 'gray' : ''" @click="changeLimitType(0,'no')">NO</div>
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
			correctPin: "",
			collapsedOffSchedule: true,
			collapsedSettings: true,
			loggedIn: true,
			screen: "connecting",
			webSocket:{
				loading: false,
				loaded: false
			},
			gate:{
				isOpening: false, // CZY BRAMA SIĘ OTWIERA
				opened: false, // CZY KRAŃCÓWKA ZAMKNIĘCIA JEST ZWARTA
				colision: false, // CZY KRAŃCÓWKA ZAMKNIĘCIA JEST ZWARTA
				isClosing: false, // CZY BRAMA SIĘ ZAMYKA
				closed: false, // CZY KRAŃCÓWKA OTWARCIA JEST ZAMKNIĘTA
				moving: false, // CZY KRAŃCÓWKA OTWARCIA JEST ZAMKNIĘTA
				scheduleOff:{
					minutes: 5, // POZOSTAŁY CZAS DO ZAMKNIĘCIA BRAMY
					confirmed: false // CZY AUTOMATYCZNE ZAMNIĘCIE JEST WŁACZONE
				},
				settings:{
					lowerLimitType:"no",
					upperLimitType:"no"
				}
			},
			pin:[],
			wrongPin: false
		};
	},
	created: function () {
		const vm = this;
		setTimeout(function(){
			vm.loadWebsocket();
		},100)
	},
	methods:{
		collapseOffSchedule: function(){
			const vm = this;
			vm.collapsedOffSchedule = !vm.collapsedOffSchedule;
		},
		collapseSettings: function(){
			const vm = this;
			vm.collapsedSettings = !vm.collapsedSettings;
		},
		goToMain: function () {
			let vm = this;
			// vm.screen = "mainScreen";
		},
		pinAdd: function(number){
			this.pin[this.pin.length] = number;
			if(this.pin.length == 4){
				this.checkPin();
			}
		},
		resetPin(){
			this.pin = [];
		},
		checkPin(){
			if(this.correctPin == this.pin.join("")){
				this.loggedIn = true;
			}else{
				this.wrongPin = true;
			}
		},
		openGate(){ // funkcja otwierająca bramę
			this.gate.isOpening = !this.gate.isOpening;
			this.ws.send(JSON.stringify({
				command:"openGate"
			}));
		},
		closeGate(){ // funkcja zamykająca bramę
			this.gate.isClosing = !this.gate.isClosing;
			this.ws.send(JSON.stringify({
				command:"closeGate"
			}));
		},
		confirmScheduleOff: function(){
			const vm = this;
			vm.gate.scheduleOff.confirmed = !vm.gate.scheduleOff.confirmed;
			let settings = {
				minutes: vm.gate.scheduleOff.minutes,
				confirmed: vm.gate.scheduleOff.confirmed
			};
			console.log(JSON.stringify(settings));
			vm.ws.send(JSON.stringify(settings));
		},
		changeLimitType: function(id, type){
			const vm = this;
			if(id == 0){
				vm.gate.settings.upperLimitType = type
			}else{
				vm.gate.settings.lowerLimitType = type
			}
			const newType = type + (id == 0 ? "_down" : "_up") ;  
			let settings = {
				id: id,
				mode: newType
			};
			vm.ws.send(JSON.stringify(settings));
		},
		unparseWebsocketMessage: function (message) {
			var vm = this;
			console.log(message);
			var wsObject = JSON.parse(message);
			vm.gate = wsObject;
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
				// ws.send("Message to send");
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
				// app.screen = "main";
				// let to = setTimeout(function () {
				// 	app.webSocket.loading = false;
				// }, 2000);
				// console.log("Closed connection");
				// $("#colorpicker").wheelColorPicker('hide');
			};
			app.ws = ws;
		},
		gateButtonClick(){
			// mainView.router.navigate('/about/');
			let vm = this;
			!vm.webSocket.loaded && !vm.webSocket.loading
				? vm.loadWebsocket()
				: vm.webSocket.loaded
				? vm.goTo("mainScreen")
				: "";
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
