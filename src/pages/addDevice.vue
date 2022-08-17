<template>
	<div class="page" data-name="addDevice">
		<a href="/">
			<div id="backButton" class="backButton">
				<p class="backButtonText">STRONA GŁÓWNA</p>
			</div>
		</a>
		<div class="headerGreen" @click="stoveButtonClick()">
			<p class="value" style="font-size:23px">
				Dodaj urządzenie
			</p>
		</div>
		<img src="../assets/img2.png">
		<div class="page-content">
			<div class="form">
				<div class="field">
					<div class="title">
						Nazwa urządzenia
					</div>
					<input type="text" name="name" placeholder="nazwa" id="name" />
				</div>
				<div class="field">
					<div class="title">
						Adres IP
					</div>
					<input type="text" name="ip" placeholder="ip" id="ip" />
				</div>
				<div class="field">
					<div class="title">
						Typ urządzenia
					</div>
					<select id="type">
						<option selected disabled hidden value="">
							Wybierz
						</option>
						<option v-for="type of types" :key="type.symbol" :value="type.symbol">
							{{ type.name }}
						</option>
					</select>
				</div>
			</div>
			<a id="addDevice" style="color:white" @click="reloadloadDevicesList()">
				<div class="newButton">
						ZAPISZ
				</div>
			</a>
		</div>
	</div>
</template>
<script>
import $ from "jquery"
import app from "./home.vue";
import store from "../js/store.js"

export default {
	data(){
		return{
			types: store.getters.types.value
		}
	},
	methods:{
		reloadloadDevicesList(){
			setTimeout(function(){
				app.loadDevicesList;
				$("#backButton").click();
			},50)
		}
	}
};
</script>