<template>
  <div ref="mainNDView" @mousewheel.prevent="scrollevent" :style="{width: '200px',height: '200px'}">
    <div v-show="isImageShow">
      <canvas ref="imageShowHandle" />
    </div>
    <div v-show="!isImageShow">
      <div ref="pixShowHandle"></div>
    </div>
    <div>
    </div>
  </div>

</template>


<script lang="ts" setup>
import { reactive,onMounted, ref, type Ref } from "vue"
import { NdView } from "../obj/ndview"
import { Heatmap } from '@antv/g2plot'

import { useElementSize } from '@vueuse/core'
const props = defineProps(['inputarr'])
// console.log('input data',props.inputarr)

const imageShowHandle: Ref<HTMLCanvasElement> = ref(null)
const pixShowHandle: Ref<HTMLElement> = ref(null)
const mainNDViewHandle = ref(null)
const isImageShow = ref(true)
var ndview_ist:NdView = null
const { width: elwidth, height: elheight } = useElementSize(mainNDViewHandle)
// const ndaxis = reactive(ndview_ist.ndaxis)
const scrollevent = (event) => {
  console.log(event)
  var delta = 0
  if (!event) event = window.event
  if (event.wheelDelta) {
    delta = event.wheelDelta / 120
    if (window.opera) delta = -delta
  } else if (event.detail) {
    delta = -event.detail / 3
  }
  ndview_ist.setScroll(delta)
  if (ndview_ist.ndregion.width>8){
    ndview_ist.viewAsImage(imageShowHandle.value)
  }else{
    ndview_ist.viewAsPix(heatmapPlot)
  }
}
var heatmapPlot=null
onMounted(
  ()=>{
    
     ndview_ist =new NdView(props.inputarr, { width: 256, height: 256 })
    ndview_ist.viewAsImage(imageShowHandle.value)
   heatmapPlot = new Heatmap(
  pixShowHandle.value,
  {
    xField: 'x',
    yField: 'y',
    xAxis: false,
    yAxis: false,
    colorField: 'v',
    color: ['#dddddd', '#9ec8e0', '#5fa4cd', '#2e7ab6', '#114d90'],
    tooltip: {
      fields: ['x', 'y', 'v'],
    },
    reflect: 'y',
    label: {
      formatter: (datum) => datum.format,
      style: {
        fill: '#fff',
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, .45)',
        fontSize: 8,
      },
    },
    axis: false,
    data: {},
    autoFit: false,
    width: elwidth,
    height: elheight,
  }
)
heatmapPlot.render()
  }
)




</script>