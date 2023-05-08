<template>
	<div class="channel" :class="channelClass">
		<div class="watchDiv" @click="playStream(channelData.id)"></div>
		<div
			class="changeChannelDiv"
			@click="changeChannel(channelData.id)"
		></div>
		<div class="loadingInfo" :class="{ swipeLeft: !loadingInfo }">
			<img :src="channelIconHref" />
			<p>Wczytywanie programu TV ...</p>
			<p style="font-weight: bold; font-size: 20px">
				{{ channelData.name }}
			</p>
		</div>
		<div class="channelName">
			{{ channelData.name }}
		</div>
		<div
			class="current"
			:style="
				'background:-webkit-linear-gradient(left,rgb(0 95 138 / 40%) ' +
				getPercentage() +
				'%,transparent 0%)'
			"
		>
			{{ channelData.epg.events[0].title }}
		</div>
		<div
			@click="playStream(channelData.id)"
			style="padding: 5px 10px; font-size: 12px"
			class="next"
		>
			<b>{{ startTime }} - {{ endTime }}</b>
			{{ channelData.epg.events[1].title }}
		</div>
	</div>
</template>

<script>
export default {
	props: {
		channelData: Object,
		recieverIp: String,
	},
	methods: {
		playStream: function (id) {
			const vm = this;
			var videoUrl = "http://" + vm.recieverIp + ":8001/" + id;

			const options = { autoPlay: true, hideControls: false };
			libVLCPlayer.play(videoUrl, options);

			// libVLCPlayer.onPauseVlc(alert("x"));
			// libVLCPlayer.onVideoEnd(alert("y"));
			// libVLCPlayer.onDestroyVlc(alert("z"));
			// libVLCPlayer.onError(alert("xA"));
			// libVLCPlayer.onVideoEnd(libVLCPlayer.stop());
			// libVLCPlayer.stop([success], [failed]);
			// window.VideoPlayerVLC.play(
			// 	videoUrl,
			// 	done => {},
			// 	error => {}
			// );
			// Just play a video
			// window.plugins.streamingMedia.playVideo(videoUrl);

			// Play a video with callbacks
			// var options = {
			// 	successCallback: function() {
			// 		console.log("Video was closed without error.");
			// 	},
			// 	errorCallback: function(errMsg) {
			// 		console.log("Error! " + errMsg);
			// 	},
			// 	orientation: 'landscape',
			// 	shouldAutoClose: true,  // true(default)/false
			// 	controls: true // true(default)/false. Used to hide controls on fullscreen
			// };
			// window.plugins.streamingMedia.playVideo(videoUrl, options);

			// var audioUrl = videoUrl;

			// // Play an audio file (not recommended, since the screen will be plain black)
			// window.plugins.streamingMedia.playAudio(audioUrl);

			// // Play an audio file with options (all options optional)
			// var options = {
			// 	bgColor: "#FFFFFF",
			// 	bgImage: "<SWEET_BACKGROUND_IMAGE>",
			// 	bgImageScale: "stretch", // other valid values: "stretch", "aspectStretch"
			// 	initFullscreen: false, // true is default. iOS only.
			// 	keepAwake: false, // prevents device from sleeping. true is default. Android only.
			// 	successCallback: function() {
			// 	console.log("Player closed without error.");
			// 	},
			// 	errorCallback: function(errMsg) {
			// 	console.log("Error! " + errMsg);
			// 	}
			// };
			// window.plugins.streamingMedia.playAudio(audioUrl, options);

			// // // Stop current audio
			// window.plugins.streamingMedia.stopAudio();

			// // // Pause current audio (iOS only)
			// window.plugins.streamingMedia.pauseAudio();

			// // // Resume current audio (iOS only)
			// window.plugins.streamingMedia.resumeAudio();
		},
		playingLechMatch: function (id) {
			const vm = this;
			const obj = vm.channelData;
			return (
				obj.epg.events.length > 1 &&
				obj.epg.events[0].title &&
				obj.epg.events[1].title &&
				(obj.epg.events[0].title.toUpperCase().includes("LECH P") ||
					obj.epg.events[1].title.toUpperCase().includes("LECH P"))
			);
		},
		changeChannel: function () {
			const vm = this;
			vm.$emit("sendChannelChangeSignal", vm.channelData.id);
		},
		getHumanTime: function (timestamp) {
			if (timestamp) {
				const date = new Date(timestamp);
				const hour =
					date.getHours() < 10
						? "0" + date.getHours()
						: date.getHours();
				const minute =
					date.getMinutes() < 10
						? "0" + date.getMinutes()
						: date.getMinutes();
				return `${hour}:${minute}`;
			} else {
				return "--:--";
			}
		},
		getPercentage: function (id) {
			const vm = this;
			let event = vm.channelData;
			event = event.epg ? event.epg.events[0] : event;
			const startTime = parseInt(event.begin_timestamp);
			const endTime =
				parseInt(event.begin_timestamp) + parseInt(event.duration_sec);
			const now = new Date();
			const currentProgress = now.getTime() - startTime * 1000;

			return parseInt(
				(currentProgress / (parseInt(event.duration_sec) * 1000)) * 100
			);
		},
	},
	computed: {
		channelClass() {
			const vm = this;
			const channelData = vm.channelData;
			return channelData.epg
				? vm.playingLechMatch(channelData.id)
					? "gold"
					: channelData.type == "sport"
					? "green"
					: channelData.type == "animation"
					? "purple"
					: ""
				: "";
		},
		startTime() {
			const channelData = this.channelData;
			return channelData.epg
				? this.getHumanTime(
						channelData.epg.events[1].begin_timestamp * 1000
				  )
				: "--:--";
		},
		endTime() {
			const channelData = this.channelData;
			return channelData.epg
				? this.getHumanTime(
						channelData.epg.events[1].begin_timestamp * 1000 +
							channelData.epg.events[1].duration_sec * 1000
				  )
				: "--:--";
		},
		loadingInfo() {
			const vm = this;
			// return true;
			return vm.channelData.epg.events[0]?.title?.includes("LOADING");
		},
		channelIconHref() {
			const vm = this;
			const channelData = vm.channelData;
			const id = vm.channelData.id;
			const idToIcon = id.slice(0, id.length - 1).replaceAll(":", "_");
			return `http://${vm.recieverIp}/picon/${idToIcon}.png`;
		},
	},
};
</script>
