import { createApp } from 'vue';
import App from './App.vue';

/**
 * Defines application root.
 * Allows to further extend with global elements like error handlers.
 */
const app = createApp(App);

app.mount('#app');

/**
 * https://vuejs.org/guide/reusability/plugins.html
 * Plugins are just functions of type: (app: App) => void.
 * It performs low level mutations such as:
 * * Defining global components
 * * Defining global directives
 * * Defining global elements
 * * Defining global context (via provide, inject)
 */
app.provide('message', 'Global message created on ROOT');
