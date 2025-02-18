<!--So called setup script, helps to avoid need for declaring separate setup functions-->
<!--It is important to note that setup is called only once during component creation-->
<script setup lang="ts">
import ButtonCounter from '@/ButtonCounter.vue';
import { onBeforeMount, onMounted, ref, useTemplateRef, watchEffect } from 'vue';

// Variables are exported implicitly
// TODO: How to declare private vars on SFC?
const msg = ref('Hello world');
const html = '<h1>HTML</h1>';

// TODO: IDE suggestions do not work correctly for dynamic attributes
const titleForDynamicAttributeOfSpan = 'title';

const attrs = {
  id: 'container',
  class: 'wrapper',
  style: 'background-color:green'
};

const renderContent = () => 'Content';

const input = useTemplateRef<HTMLInputElement>('input');

/**
 * Run before DOM mutations phase but after reactive data has changed.
 *
 * There are other modes as well:
 * flush post - Fires after DOM updates and browser paint (similar to useEffect)
 * flush sync - Fires exactly when value updated (without batching)
 */
watchEffect(() => {
  console.log('watchEffect PRE', input.value); // Outputs null because input is not mounted yet
}, { flush: 'pre' });

watchEffect(() => {
  console.log('watchEffect POST', input.value); // Outputs input as it is already mounted
}, { flush: 'post' });

// Called before DOM update
onBeforeMount(() => console.log('onBeforeMount', input.value));

// Called after DOM update
onMounted(() => console.log('onMounted', input.value));
</script>

<!--template is a so called Fragment node-->
<template>
  <span>Message: {{ msg }}</span>
  <!--  Directives are prefixed with v- -->
  <!--  Sets innerHtml property from node. Implementation is hidden. -->
  <span v-html="html"></span>
  <!--  Used to bind attributes. Merges props when used dynamically -->
  <!--  TODO: Is not type safe for dynamic args -->
  <div :title="msg" v-bind="attrs">
    <button :disabled="true">Help</button>
  </div>
  <!--  Supports any expression inside mustache -->
  <!--  Functions called inside binding expressions will be called every time the component updates -->
  <span>{{ renderContent() }}</span>
  <!--  Globals are accessed through _ctx object. -->
  <!--  TODO: WebAPI is not fully available by default -->
  <h1>{{ new Date() }}</h1>
  <!--  Transforms into a simple condition inside. -->
  <!--  TODO: There is no example usages on inline docs -->
  <p v-if="msg.length === 0">Now you see me</p>
  <span :[titleForDynamicAttributeOfSpan]="msg"></span>
  <ul>
    <!--  Uses renderList internally, which just maps array or collection-->
    <!--  There is the same number of problems related to elements in queue comparison (key property may help)-->
    <li v-for="(user, index) of ['Andrey', 'Ivan', 'Anatoly']">
      {{ user + '-' + index }}
    </li>
  </ul>
  <ButtonCounter title="Button title" @increment="console.log('increment')">
    <template v-slot:default="input">
      {{ msg }} {{ input.secret }}
    </template>
  </ButtonCounter>
  <input ref="input" v-model="msg">
</template>
