<template>

  <a-layout>
    <a-layout-sider>
      <div v-for="(path,index) in current.list" :key="index">
        <a-button v-on:click="changeCurrentMat(path)"> {{path}}</a-button>
      </div>
      <div>
        <canvas ref="imageShowHandle" />
      </div>
    </a-layout-sider>
    <a-layout-content>
      <div v-if="current.currentMat">
        <NDArrayPixView :inputarr="current.currentMat" :width="550" :height="250" />
      </div>
    </a-layout-content>
  </a-layout>

</template>

<script setup lang="ts">

// import { VueMathjax } from 'vue-mathjax-next'
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import NDArrayPixView from './components/NDArrayPixView.vue'
import { NdView } from "./obj/ndaspect"

import ndarray from 'ndarray'
import { ref, shallowRef,  shallowReactive, nextTick } from "vue"
import npyjs from "npyjs";
let n = new npyjs();
const imageShowHandle: Ref<HTMLCanvasElement> = ref(null)
const test_list = [
  "zero.npy",
  "zero255.npy",
  "12.npy",
  "text.npy",
  "abc"
]

const current = shallowReactive(
  { list: test_list, currentMat: null }
)


function changeCurrentMat(path: string) {
  n.load(path, async (array) => {
    const temparr = ndarray(array.data, array.shape);
    current.currentMat = null
    await nextTick()
    const elSize = { width: 256, height: 256 }
    current.currentMat = new NdView(temparr, elSize,)
    current.currentMat.drawImage(imageShowHandle.value,elSize)
  });
}

// n.load("zero.npy", (array) => {


// const formula = '$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$'
// console.log('formula',formula)

</script>



<style scoped>

</style>
