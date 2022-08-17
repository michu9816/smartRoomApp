// Import Vue
import { createApp } from 'vue';
// Import Framework7
import Framework7 from 'framework7/lite-bundle';

// Import Framework7-Vue Plugin
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';

// Import Framework7 Styles
import 'framework7/framework7-bundle.css';

// import * as jQuery from 'jquery';
// import "../js/jquery.wheelcolorpicker.js"
// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/gate.css';
import '../css/app.css';
import '../css/all.css';
import '../css/tv.css';
import '../css/wheelcolorpicker.css'
import '../assets/icons/pro/css/all.css';

// Import App Componen
import App from '../components/app.vue';

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

// Init App
const app = createApp(App);

// Register Framework7 Vue components
registerComponents(app);

// Mount the app
app.mount('#app');

