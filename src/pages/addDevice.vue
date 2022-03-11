<template>
	<div class="page" data-name="addDevice">
		<a href="/">
			<div class="backButton">
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
						<option value="led">
							Pasek LED
						</option>
						<option value="lamp">
							Lampki
						</option>
						<option value="bathroom">
							Wentylator łazienkowy
						</option>
						<option value="tv">
							Dekoder Open Webif
						</option>
						<option value="gate">
							Brama
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
import app from "./home.vue";
	export default {
		methods:{
			reloadloadDevicesList(){
				setTimeout(function(){
					app.loadDevicesList;
				},50)
			}
		}
	};
</script>