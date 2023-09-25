import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.min.css';
import 'vuetify/dist/vuetify.min.css'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'


import { createPinia } from 'pinia';

import router from './router';


const vuetify = createVuetify({
  components,
  directives,
  icons:{
    iconfont: 'mdi',
  }
})

const app = createApp(App);
app.component('VueDatePicker', VueDatePicker);

app.use(createPinia()).use(router).use(vuetify).mount('#app')