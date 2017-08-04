import 'lazysizes';
import 'svgxuse';
import 'babel-polyfill'; // eslint-disable-line
import '../scss/app.scss'; /* eslint-disable */

import Vue from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
  
new Vue({
  el: '#app',
  render: createElement => createElement(App),
  store,router
});
    