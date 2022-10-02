<template>


  <!-- <main> -->
    <template v-if="dmat">
      <NDArrayView :inputarr="dmat" />
    </template>
  <!-- </main>/ -->
  <!-- <HelloWorld/> -->
</template>

<script setup lang="ts">
// import { VueMathjax } from 'vue-mathjax-next'
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import NDArrayView from './components/NDArrayView.vue'
import ndarray from 'ndarray'
import {ref,shallowRef} from "vue"
import npyjs from "npyjs";
let n = new npyjs();
const dmat = shallowRef(null)
n.load("text.npy", (array) => {
    // `array` is a one-dimensional array of the raw data
    // `shape` is a one-dimensional array that holds a numpy-style shape.
    console.log(array.data)
    
    dmat.value = ndarray(array.data, array.shape);
    console.log('load npy:',dmat.value);

// const formula = "$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$"

});

// const formula = '$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$'
// console.log('formula',formula)

</script>



<style scoped>
</style>
