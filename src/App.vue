<template>

  <a-layout >
    <a-layout-sider :style="{height:winHeight+'px'}" class='flex-box' >
      <div  :style="{height:winHeight-210 +'px'}">

        <div v-for="(path,index) in current.list" :key="index">
          <a-button v-on:click="changeCurrentMat(path)"> {{path}}</a-button>
        </div>
      </div>
      <div class='bottom'>
        <canvas ref="imageShowHandle" height="200" width="200"/>
      </div>
    </a-layout-sider>
    <a-layout-content  ref="contentHandle" >
      <div v-if="current.currentMat">
        <NDArrayPixView :inputarr="current.currentMat" 
        :width="contentWidth" 
        :height="winHeight-50" />
      </div>
    </a-layout-content>
  </a-layout>

</template>

<script setup lang="ts">
// TODO heatmap: image size/ element size 
// TODO thumbnail: image size/ element size 
// TODO heatmap element size 获取到 content size 往下传
// TODO thumbnail element size 获取到 sider的size的宽，高度固定一个数值：h。
// import { VueMathjax } from 'vue-mathjax-next'
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import NDArrayPixView from './components/NDArrayPixView.vue'
import { NdView } from "./obj/ndaspect"
import { useElementSize } from '@vueuse/core'

import ndarray from 'ndarray'
import { ref, shallowRef,  shallowReactive, nextTick } from "vue"
import { useWindowSize } from '@vueuse/core'

import npyjs from "npyjs";
let n = new npyjs();
const imageShowHandle: Ref<HTMLCanvasElement> = ref(null)
const contentHandle: Ref<HTMLCanvasElement> = ref(null)
const test_list = [
  "zero.npy",
  "zero255.npy",
  "12.npy",
  "text.npy",
]

const current = shallowReactive(
  { list: test_list, currentMat: null }
)
const {width:contentWidth,height:contentHeight} = useElementSize(contentHandle)
const {width:thumbnailWidth,height:thumbnailHeight} = useElementSize(imageShowHandle)
const { width:winWidth, height:winHeight } = useWindowSize()
const heatmapElSize = { width: contentWidth.value, height: winHeight.value-30 }
console.log('thumbnail',thumbnailHeight,thumbnailWidth)



function changeCurrentMat(path: string) {
  n.load(path, async (array) => {
    const temparr = ndarray(array.data, array.shape);
    current.currentMat = null
    await nextTick()
    // const heatmapElSize = { width: contentWidth.value, height: winHeight.value-30 }
    console.log('heatmap',heatmapElSize)
    current.currentMat = new NdView(temparr, {width:0,height:0},)
    current.currentMat.drawImage(imageShowHandle.value,
        {
          width:thumbnailWidth.value,
          height:thumbnailWidth.value
        })
  });
}

// n.load("zero.npy", (array) => {


// const formula = '$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.$$'
// console.log('formula',formula)

</script>



<style scoped>
.main {
  width: 100%;
  height: 100%;
}

.flex-box {
    display: flex;
    min-height: 100%;
    flex-flow: row wrap;
    /* width: 300px; */
}
.variable {
    width: 100%;
    /* height: 100px;  */
    /* background: green; */
    align-self: flex-start;
}
.bottom {
    width: 100%;
    /* height: 50px; */
    /* background: blue; */
    align-self: flex-end;
}
</style>
