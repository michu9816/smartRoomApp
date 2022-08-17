<template>
    <a :href="href">
        <div :id="data.id" class="mainMenuItem home" :class="color">
            <li class = "swipeout">
                <div class="listDevice swipeout-content item-content">
                    <div class="icon">
                        <i class="fas"
                        :class="icon"></i>
                    </div>
                    <div class="deviceName">
                       <div class="name">{{ data.name }}</div>
                       <div class="typeName">{{ type }}</div>
                    </div>
                    <div class="rightArrow">
                        <i class="fas fa-angle-right"></i>
                    </div>
                </div>
                <div class = "swipeout-actions-right">
                    <a href = "#" class = "swipeout-arrows-up" @click="moveDevice('up')" v-if="!isFirst"><i class="fas fa-arrow-up"></i></a>
                    <a href = "#" class = "swipeout-arrows-down" @click="moveDevice('down')" v-if="!isLast"><i class="fas fa-arrow-down"></i></a>
                    <a href = "#" class = "swipeout-delete" @click="removeDevice">Usuń</a>
                </div>
            </li>
        </div>
    </a>
</template>

<script>
import database from '../js/database.js';
import store from "../js/store.js"

export default {
    props: {
        data: Object,
        index: Number
    },
    computed:{
        href(){
            return `${this.data.type}/${this.data.id}`
        },
        color(){
            return store.getters.types.value.find(obj => obj.symbol == this.data.type)?.color || "";
        },
        type(){
            return store.getters.types.value.find(obj => obj.symbol == this.data.type)?.name  || "";
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
        },
        icon(){
            return store.getters.types.value.find(obj => obj.symbol == this.data.type)?.icon || ""
        },
        devices(){
            let devices = store.getters.devices;
            devices = devices.value.sort(function(a, b){return a.position - b.position});
            return devices;
        },
        isFirst(){
            return this.data.position == 1;
        },
        isLast(){
            const devices = this.devices;
            return this.data.position == devices[devices.length - 1].position;
        }
    },
    methods:{
        removeDevice(){
            database.RemoveDevice(this.data.id)
        },
        moveDevice(direction){
            this.$emit("move-device",this.data.position,direction);
        }
    }
}
</script>