<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

  </header>

  <main>
    <!-- <textarea v-model="formula" /> -->
    hello:

    <!-- <NDArray /> -->
  </main>
  <!-- <vue-mathjax :formula="formula" />
  <HelloWorld/> -->
  <HelloWorld/>
</template>

<script setup lang="ts">
// import { VueMathjax } from 'vue-mathjax-next'
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
// import {NDArray} from './components/NDArray.vue'
import ndarray from 'ndarray'
import {ref} from "vue"
import npyjs from "npyjs";
let n = new npyjs();
n.load("zero.npy", (array) => {
    // `array` is a one-dimensional array of the raw data
    // `shape` is a one-dimensional array that holds a numpy-style shape.
    console.log(array.data)
    
    var mat = ndarray(array.data, array.shape);
    console.log(mat.get(0,1) );
// const formula = "$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$"

});

// const formula = '$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$'
// console.log('formula',formula)

</script>



<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
