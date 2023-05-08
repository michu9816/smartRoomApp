<template>
	<f7-page name="home">
		<div class="headerGreen blue" @click="sendPowerSignal(0)">
			<p class="value">{{ thisDeviceData[0].name }}</p>
			<p class="description">
				{{ recieverStatus.inStandby == "true" ? "Włącz" : "Wyłącz" }}
			</p>
		</div>
		<img src="../assets/img3.png" />
		<div class="menuBg">
			<div class="menu">
				<div
					class="menuItem"
					v-for="item in menuItems"
					:key="item"
					@click="changeTab(item.tab)"
					:class="selectedTab == item.tab ? 'selected' : ''"
				>
					{{ item.name }}
				</div>
			</div>
		</div>
		<div class="remote" v-if="selectedTab == 'remote'">
			<tvChannel
				v-for="(channel, index) in channels.filter(
					(obj) => obj.id == recieverStatus.currservice_serviceref
				)"
				:channelData="channel"
				:recieverIp="recieverIp"
				:key="index"
				@sendChannelChangeSignal="sendChannelChangeSignal"
			></tvChannel>
			<div class="previousChannels" v-if="history.length">
				<div class="header">Ostatnie kanały</div>
				<tvHistory
					v-for="(item, index) in history"
					:channelData="item"
					:recieverIp="recieverIp"
					:key="index"
					@sendChannelChangeSignal="sendChannelChangeSignal"
				></tvHistory>
			</div>
			<div class="tvButtonRow" v-for="row in 3" :key="row">
				<div
					class="tvButton"
					v-for="button in 3"
					:key="button"
					@click="sendSignal(row * button + 1)"
				>
					{{ row * button }}
				</div>
			</div>
			<div class="tvButtonRow">
				<div class="tvButton">MENU</div>
				<div class="tvButton" @click="sendSignal(0)">0</div>
				<div class="tvButton">EXIT</div>
			</div>
		</div>
		<div class="channels" v-if="selectedTab == 'channels'">
			<div class="matchLive" v-if="lechMatches().length">
				<div class="header">
					<div class="title">LECH GRA!</div>
				</div>
				<div>
					<tvChannel
						v-for="(channel, index) in lechMatches()"
						:channelData="channel"
						:recieverIp="recieverIp"
						:key="index"
						@sendChannelChangeSignal="sendChannelChangeSignal"
						class="gray"
					></tvChannel>
				</div>
			</div>
			<div class="categories">
				<div
					class="item"
					v-for="filter in filters"
					:key="filter"
					:class="selectedFilter == filter.value ? 'selected' : ''"
					@click="changeFilter(filter.value)"
				>
					{{ filter.name }}
				</div>
			</div>
			<tvChannel
				v-for="(channel, index) in channels.filter((obj) =>
					JSON.stringify(obj).includes(selectedFilter || '')
				)"
				:channelData="channel"
				:recieverIp="recieverIp"
				:key="index"
				@sendChannelChangeSignal="sendChannelChangeSignal"
			></tvChannel>
		</div>
	</f7-page>
</template>

<script>
import "../css/tv.css";
import tvChannel from "../components/tv-channel.vue";
import tvHistory from "../components/tv-history.vue";
import channelsList from "../js/channels.json";
import store from "../js/store.js";

export default {
	components: {
		tvChannel: tvChannel,
		tvHistory: tvHistory,
	},
	props: {
		f7route: Object,
		f7router: Object,
	},
	data() {
		return {
			recieverIp: "192.168.8.30",
			selectedTab: "remote",
			menuItems: [
				{
					name: "Pilot",
					tab: "remote",
				},
				{
					name: "Kanały",
					tab: "channels",
				},
			],
			progress: 0,
			channels: channelsList.channels,
			selectedFilter: undefined,
			filters: [
				{
					name: "Filmy",
					value: "movie",
				},
				{
					name: "Bajki",
					value: "animation",
				},
				{
					name: "Sport",
					value: "sport",
				},
				{
					name: "VOD",
					value: "vod",
				},
			],
			epg: {
				events: [{ title: "Next" }],
			},
			history: [],
			recieverStatus: {
				inStandby: "false",
				currservice_begin: "05:10",
				muted: true,
				isRecording: "false",
				volume: 100,
				currservice_fulldescription: "N/A",
				currservice_name: "N/A",
				currservice_filename: "",
				transcoding: false,
				currservice_end: "10:20",
				currservice_description: "",
			},
		};
	},
	created: function () {
		const vm = this;
		vm.recieverIp = vm.deviceAddress.ip;
		for (
			let channelIndex = 0;
			channelIndex < vm.channels.length;
			channelIndex++
		) {
			// vm.channels[channelIndex].epg = {"events": [{"sname": "Puls 2", "title": "Lombard. \u017bycie pod zastaw 5 (odc. 234)", "begin_timestamp": 1630975800, "now_timestamp": 1630931217, "sref": "1:0:1:3D60:2C88:13E:820000:0:0:0:", "id": 54145, "duration_sec": 3600, "shortdesc": "", "longdesc": "And\u017celik\u0119 zaczynaj\u0105 m\u0119czy\u0107 w\u0105tpliwo\u015bci zwi\u0105zane z jej \u017cyciem uczuciowym. Po powrocie Lolka Roman ko\u0144czy dorywcz\u0105 prac\u0119 w lombardzie. Ma jednak plan zwi\u0105zany z tym miejscem.Tytu\u0142 oryginalny: Lombard. \u017bycie pod zastaw\nPolska, 2019\nRe\u017cyseria: Piotr Kolski\nWyst\u0119puj\u0105: Zbigniew Buczkowski, Henryk Go\u0142\u0119biewski, Tomasz Kutera, Mateusz Mura\u0144ski, Jerzy G\u00f3rski, Agata Szafra\u0144ska\n[N]. \n\nProwadzenie lombardu to zaj\u0119cie ciekawe, momentami ekscytuj\u0105ce, ale cz\u0119sto i niebezpieczne. Bohaterami serialu s\u0105: w\u0142a\u015bciciel Kazimierz Barski (Zbigniew Buczkowski), jego rodzina, pracownicy oraz klienci, kt\u00f3rzy pojawiaj\u0105 si\u0119 w lombardzie z powodu r\u00f3\u017cnych \u017cyciowych zawirowa\u0144. S\u0105 to zar\u00f3wno osoby starsze, potrzebuj\u0105ce \u015brodk\u00f3w do \u017cycia, jak i m\u0142ode, kt\u00f3re zastawiaj\u0105 na kilka dni laptop czy telefon.", "remaining": 48183}], "result": true}
			vm.channels[channelIndex].epg = {
				events: [
					{
						sname: "",
						title: "LOADING ...",
					},
					{
						sname: "",
						title: "-",
					},
				],
			};
		}
		vm.getStatus();
		vm.refreshEPG();
		const statusInterval = setInterval(function () {
			vm.getStatus();
		}, 20000);
		const epgInterval = setInterval(function () {
			vm.refreshEPG();
		}, 60000);
	},
	methods: {
		getStatus: function (signal) {
			const vm = this;
			console.debug("Loading playing epg");
			try {
				const ip = `http://${vm.recieverIp}/api/statusinfo`;
				vm.sendHTTPRequest(ip).then((res) => {
					vm.recieverStatus = JSON.parse(res);
				});
			} catch (e) {
				alert(e);
			}
		},
		sendSignal: function (signal) {
			const vm = this;

			const ip = `http://${vm.recieverIp}/api/remotecontrol?command=${signal}`;
			const response = vm.sendHTTPRequest(ip);

			vm.getStatus();
		},
		sendChannelChangeSignal: function (signal) {
			const vm = this;

			const ip = `http://${vm.recieverIp}/api/zap?sRef=${signal}`;
			const response = vm.sendHTTPRequest(ip);

			vm.getStatus();
			setTimeout(function () {
				vm.getStatus();
			}, 5000);
		},
		sendPowerSignal: function (signal) {
			const vm = this;

			const ip = `http://${vm.recieverIp}/api/powerstate?newstate=${signal}`;
			const response = vm.sendHTTPRequest(ip);

			vm.getStatus();
			setTimeout(function () {
				vm.getStatus();
			}, 1000);
		},
		changeTab: function (tab) {
			const vm = this;
			vm.selectedTab = tab;
		},
		refreshEPG: function () {
			const vm = this;
			for (
				let channelIndex = 0;
				channelIndex < vm.channels.length;
				channelIndex++
			) {
				const ip = `http://${vm.recieverIp}/api/epgservicelistnownext?sList=${vm.channels[channelIndex].id}`;
				vm.sendHTTPRequest(ip).then((res) => {
					vm.channels[channelIndex].epg = JSON.parse(res);
				});
				// const response = vm.sendHTTPRequest(ip);
				// if (response) {
				// 	vm.channels[channelIndex].epg = JSON.parse(response);
				// }
			}
		},
		changeFilter: function (filter) {
			const vm = this;
			vm.selectedFilter =
				vm.selectedFilter == filter ? undefined : filter;
		},
		lechMatches: function () {
			const vm = this;
			return vm.channels.filter(
				(obj) =>
					obj.epg.events.length > 1 &&
					obj.epg.events[0].title &&
					obj.epg.events[1].title &&
					(obj.epg.events[0].title.toUpperCase().includes("LECH P") ||
						obj.epg.events[1].title
							.toUpperCase()
							.includes("LECH P"))
			);
		},
		sendHTTPRequest(ip, data, success, fail) {
			return new Promise((resolve, reject) => {
				let request = new XMLHttpRequest();
				request.open("GET", ip, true);

				request.onreadystatechange = function (event) {
					if (this.readyState === XMLHttpRequest.DONE) {
						if (this.status === 200) {
							resolve(request.response);
						} else {
							reject(request.response);
						}
					}
				};

				request.setRequestHeader("Access-Control-Allow-Headers", "*");
				request.setRequestHeader(
					"Content-type",
					"application/ecmascript"
				);
				request.setRequestHeader("Access-Control-Allow-Origin", "*");

				request.send(null);
			});
		},
	},
	computed: {
		thisDeviceData() {
			const vm = this;
			const list = store.getters.devices.value;

			return list.filter((obj) => obj.id == vm.f7route.params.deviceId);
		},
		deviceAddress() {
			const vm = this;
			const address = vm.thisDeviceData[0].ip;
			return {
				ip: address.split(":")[0],
				port: address.split(":")[1] || 81,
			};
		},
	},
	watch: {
		recieverStatus: {
			deep: true,
			handler() {
				const vm = this;
				if (vm.history.length > 3) {
					vm.history = vm.history.slice(1, 4);
				}
				let historyIndex = vm.history.findIndex(
					(obj) => obj.name == vm.recieverStatus.currservice_station
				);
				if (
					historyIndex == -1 &&
					vm.recieverStatus.currservice_name != "N/A"
				) {
					vm.history.push({
						name: vm.recieverStatus.currservice_station,
						id: vm.recieverStatus.currservice_serviceref,
					});
				}
			},
		},
	},
};
</script>
