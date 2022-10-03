<template>


  <!-- <main> -->
    <template v-if="dmat">
      <NDArrayView :inputarr="dmat" :width="250" :height="250" />
    </template>
  <!-- </main>/ -->
  <!-- <HelloWorld/> -->
</template>

<script setup lang="ts">
// TODO LIST
// 打开时候是否需要占满屏幕
// 初始化固定尺寸，默认为图片尺寸。
// 初始化时图片即按宽高填满组件
// 最大尺寸需要根据heatmap的格子去计算，不是固定尺寸。
// 颜色处理
// 单色图设置meta range，设定gray范围
// RGB图采用color字段，来设定颜色范围
// tooltips处理
// 单色图，rgb图里面每一格的内容通过tooltips显示。
// 
// import { VueMathjax } from 'vue-mathjax-next'
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import NDArrayView from './components/NDArrayView.vue'
import ndarray from 'ndarray'
import {ref,shallowRef} from "vue"
import npyjs from "npyjs";
let n = new npyjs();
const dmat = shallowRef(null)
// n.load("zero.npy", (array) => {
n.load("12.npy", (array) => {

    // `array` is a one-dimensional array of the raw data
    // `shape` is a one-dimensional array that holds a numpy-style shape.
    // console.log(array.data)
    
    dmat.value = ndarray(array.data, array.shape);
    console.log('load npy:',dmat.value);

// const formula = "$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$"

});

// const formula = '$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$'
// console.log('formula',formula)

</script>



<style scoped>
</style>
