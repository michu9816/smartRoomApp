<template>
	<f7-page name="home" style="padding-bottom: 40px">
		<div class="headerGreen" @click="stoveButtonClick()">
			<!-- <p v-if="stoveTemperature!='-'" style="
				position: absolute;
				right: 20px;
				font-weight: bold;
			">{{ stoveTemperatureSpeed }} / min</p>
			<p class="value" v-if="stoveTemperature!='-'">
				{{ stoveTemperature }}&deg;
			</p>
			<p class="description">
				{{ stoveWebSocket.loading ? 
				"Pobieranie danych z pieca..." : 
				stoveWebSocket.loaded ? 
				"Temperatura pieca" : "Dotknij, aby wczytać temperaturę pieca."
				}}
			</p> -->
		</div>
		<img src="../assets/img2.png" />
		<!-- Devices List -->
		<listDevice
			v-for="(device, index) in devices"
			:key="index"
			:data="device"
			:index="index"
			@move-device="moveDevice"
		>
		</listDevice>
		<a href="/new/">
			<div class="newButton">
				<i class="fas fa-plus"></i>
			</div>
		</a>
	</f7-page>
</template>

<script>
import $ from "jquery";
import store from "../js/store.js";
import database from "../js/database.js";

import listDevice from "../components/listDevice.vue";

export default {
	components: {
		listDevice,
	},
	data() {
		return {
			devices: [],
		};
	},
	created: function () {
		const vm = this;
		vm.loadDevicesList();
	},
	methods: {
		loadDevicesList() {
			const vm = this;
			let list = store.getters.devices.value;
			if (list[0] == "loading" || list[0] == null) {
				setTimeout(vm.loadDevicesList, 500);
			} else {
				this.refreshDevicesList();
			}
		},
		refreshDevicesList() {
			const vm = this;
			console.log("refresh");
			let devices = store.getters.devices.value;
			devices = devices.sort(function (a, b) {
				return a.position - b.position;
			});
			vm.devices = devices;
		},
		moveDevice(position, direction) {
			const vm = this;
			database.ChangeDevicePosition(position, direction);
			setTimeout(function () {
				vm.refreshDevicesList();
				$(".swipeout")
					.css({ transform: "" })
					.removeClass("swipeout-actions-opened")
					.find(".swipeout-arrows-up, .swipeout-delete")
					.css({ transform: "" });
				$(".listDevice.swipeout-content").css({ transform: "" });
			}, 50);
		},
	},
};
</script>

