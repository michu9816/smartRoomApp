// Import Vue
import { createApp } from 'vue';
// Import Framework7
import Framework7 from 'framework7/lite-bundle';

// Import Framework7-Vue Plugin
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';

// Import Framework7 Styles
import 'framework7/framework7-bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';
import '../css/wheelcolorpicker.css'
import '../assets/icons/pro/css/all.css';

import '../js/jquery.js';
// import '../js/jquery.wheelcolorpicker.js';
// Import App Component
import App from '../components/app.vue';
import database from '../js/database.js';
import $$ from 'dom7';


// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

// Init App
const app = createApp(App);

// Register Framework7 Vue components
registerComponents(app);

// Mount the app
app.mount('#app');

database.init();

$$(document).on('page:init', '.page[data-name="addDevice"]', function (e) {
    $$('#addDevice').on('click', () => {
        let type = $$('#type').val();
        let name = $$('#name').val();
        let ip = $$('#ip').val();
        database.AddDevice(type,name,ip);
    });
});