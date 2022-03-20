<template>
	<div class="item" @click="changeChannel(channelData.id)">
		{{ channelName }}
		<img :src="channelIconHref">
	</div>
</template>

<script>
export default {
	props:{
		channelData: Object,
		recieverIp: String
	},
	methods:{
		changeChannel: function(){
			const vm = this;
			vm.$emit("sendChannelChangeSignal",vm.channelData.id)
		},
	},
	computed:{
		channelName(){
			const vm = this;
			const channelData = vm.channelData;
			return channelData.name;
		},
		channelIconHref(){
			const vm = this;
			const channelData = vm.channelData;
			const id = vm.channelData.id;
			const idToIcon = id
				.slice(0,id.length-1)
				.replaceAll(":","_")
			return `http://${vm.recieverIp}/picon/${idToIcon}.png`;
		}
	}
}
</script>