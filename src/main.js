import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import ArgonDashboard from "./argon-dashboard";
import GoogleLogin from 'vue3-google-login';

const appInstance = createApp(App);
appInstance.use(store);
appInstance.use(router);
appInstance.use(ArgonDashboard);
appInstance.use(GoogleLogin, {
    clientId: '45862946718-pdtkbpgpkdrgmchki5o1sa5kfgq57nsn.apps.googleusercontent.com'
  });
appInstance.mount("#app");
