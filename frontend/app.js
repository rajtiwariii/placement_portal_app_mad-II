const app = Vue.createApp({});
app.component('navbar-component', NavbarComponent);
app.use(router);
app.mount('#app');