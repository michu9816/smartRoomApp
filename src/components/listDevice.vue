<template>
    <a :href="href">
        <div :id="data.id" class="mainMenuItem home" :class="color">
            <li class = "swipeout">
                <div class="connectionStatus swipeout-content item-content">
                    <div class="mainMenuBoxTitle">
                        <p class="mainMenuBoxTitleText">{{ data.name }}</p>
                    </div>
                    <img :src="img" class="image">
                    <p class="mainText">Kliknij, aby sterować!</p>
                </div>
                <div class = "swipeout-actions-right">
                    <a href = "#" class = "swipeout-delete" @click="removeDevice">Usuń</a>
                </div>
            </li>
        </div>
    </a>
</template>

<script>
import database from '../js/database.js';

export default {
    props: {
        data: Object,
        index: Number
    },
	data() {
		return {
			devices: []
		};
	},
    computed:{
        href(){
            return `${this.data.type}/${this.data.id}`
        },
        color(){
            switch(this.data.type){
                case "led":
                case "gate":
                    return "";
                case "bathroom":
                    return "green";
                case "tv":
                    return "blue";
            }
        },
        img(){
            switch(this.data.type){
                case "led":
                case "gate":
                    return "../../assets/img1.png";
                case "bathroom":
                    return "../../assets/img4.png"
                case "tv":
                    return "../../assets/img3.png"
            }
        }
    },
    methods:{
        removeDevice(){
            database.RemoveDevice(this.data.id)
        }
    }
}
</script>