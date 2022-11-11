<template>

  <a-layout >
    <a-layout-sider :style="{height:winHeight+'px'}" class='flex-box-sider' >
      <div class="hscroll" :style="{height:winHeight-210 +'px'}">

        <div v-for="(path,index) in current.list" :key="index">
          <a-button class="box-button" v-on:click="changeCurrentMat(path)"> {{getFilename(path)}}</a-button>
        </div>
      </div>
      <div class='bottom'>
        <canvas ref="imageShowHandle" height="200" width="200"/>
      </div>
    </a-layout-sider>
    <a-layout-content class="box-content"  ref="contentHandle" >
      <div v-if="current.currentMat">
        <NDArrayPixView :inputarr="current.currentMat" 
        :width="contentWidth" 
        :height="winHeight-50" />
      </div>
    </a-layout-content>
  </a-layout>

</template>

<script setup lang="ts">
// TODO 优化单个格子的大小
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
var test_list = [
  "data/zero.npy",
  "data/zero255.npy",
  "data/12.npy",
  "data/text.npy",

  "data/zero.npy",
  "data/zero255.npy",
  "data/12.npy",
  "data/text.npy",
  "data/zero.npy",
  "data/zero255.npy",
  "data/12.npy",
  "data/text.npy",
  "data/zero.npy",
  "data/zero255.npy",
  "data/12.npy",
  "data/text.npy",
]
console.log('window input',window)
if (window.input){
  test_list = window.input
}
const current = shallowReactive(
  { list: test_list, currentMat: null }
)
const {width:contentWidth, height:contentHeight} = useElementSize(contentHandle)
const {width:thumbnailWidth, height:thumbnailHeight} = useElementSize(imageShowHandle)
const {width:winWidth, height:winHeight } = useWindowSize()
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

function getFilename(path:string){
  path = path.replace('\\','/')
  const index = path.lastIndexOf('/')
  return path.substring(index+1)
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

.flex-box-sider {
    display: flex;
    min-height: 100%;
    flex-flow: row wrap;
    background-color: white;
    margin-top: 16px;
    margin-bottom: 16px;
    margin-left: 16px;
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
    /* margin-top: 16px;
    margin-left: 16px; */
    /* height: 50px; */
    /* background: blue; */
    align-self: flex-end;
}
.box-content {
  margin-top: 16px;
  margin-left: 16px;
}

.box-button{
  margin-left: 8px;
  margin-right: 8px;
  margin-bottom: 8px;
  width: 93%;
}

.hscroll{
  overflow: hidden;
  overflow-y: scroll; 
}

::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
::-webkit-scrollbar-button {
    display: none;
  }
::-webkit-scrollbar-thumb {
    background: rgba(144, 147, 153, 0.3);
    cursor: pointer;
    border-radius: 4px;
  }
::-webkit-scrollbar-corner {
    display: none;
  }
::-webkit-resizer {
    display: none;
  }


</style>
