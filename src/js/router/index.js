import Vue from 'vue';
import Router from 'vue-router';

// Normal import: Autocomplete does work
import foo from 'Js/helpers/Guars';
import Landing from 'Js/views/Home.vue';

// Vue Routes Lazyloading: Autocomplete does not Work


const Home = () => import(/* webpackChunkName: 'router-home' */ 'Routes/Home.vue');

// Lazyloading as described in Webpack Config: Autocomplete does not work
import('Js/helpers/Guars.js')
  .then(functions => functions.test())
  .catch(error => console.error(error));

foo.test();

Vue.use(Router);

export default new Router({
  routes: [{ path: '/', component: Home }, { path: '/Landing', component: Landing }],
});
