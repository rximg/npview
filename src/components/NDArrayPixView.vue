<template>
  <div class="main">
    <a-row>
      <a-col :span="23">
        <div  class="main" ref="pixShowHandle"></div>
    </a-col>
    <a-col :span="1">
      <a-slider id="sliderv" v-model:value="slider_value.v" :min="0" :max="slider_value.v_max" :reverse="true"
        :vertical="true" />
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="24">
      <a-slider id="sliderh" v-model:value="slider_value.h" :min="0" :max="slider_value.h_max" :vertical="false" />
    </a-col>
  </a-row>
</div>
</template>


<script lang="ts" setup>
//TODO  输入的宽高是反的
//TODO 需要理清宽高
import { reactive, onMounted, ref, type Ref, watchEffect } from "vue"
import { NdView } from "../obj/ndaspect"
import { Heatmap } from '@antv/g2plot'
import _ from 'lodash'
import { useElementSize } from '@vueuse/core'
const props = defineProps(['inputarr', 'width', 'height'])//TODO 传入的是inputarray，是否需要传入宽高
// console.log('input data',props.inputarr)
var heatmapPlot: Heatmap = null
var ndview_ist = props.inputarr
const pixShowHandle: Ref<HTMLElement> = ref(null)
const slider_value = reactive(
  {
    v: 0,
    h: 0,
    v_max: 0,
    h_max: 0
  }
)

const {width:elWidth,height:elHeight} = useElementSize(pixShowHandle)


onMounted(
  () => {
    const elSize = { width: props.width, height: props.height }
    console.log('heatmap el size',elSize,elHeight.value,elWidth.value)
    // ndview_ist = new NdView(props.inputarr, elSize,)
    slider_value.v_max = ndview_ist.store.shape[0]
    slider_value.h_max = ndview_ist.store.shape[1]
    ndview_ist.elementSize = elSize
    const data = []
    heatmapPlot = new Heatmap(
      pixShowHandle.value,
      {
        data,
        xField: 'x',
        yField: 'y',
        xAxis: false,
        yAxis: false,
        colorField: 'value',
        color: ['#174c83', '#7eb6d4', '#efefeb', '#efa759', '#9b4d16'],
        tooltip: {
          fields: ['x', 'y', 'value'],
        },
        reflect: 'y',
        label: {
          formatter: (datum) => {
            console.log(datum)
            return datum.format
          },
          style: {
            fill: '#fff',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
            fontSize: 32,
          },
        },
        autoFit: true,
        width: elSize.width,
        height: elSize.height,
      },

    )
    // heatmapPlot.render()
    // ndview_ist.viewAsPix(heatmapPlot)
    watchEffect(
      () => {
        // console.log('watchEffect',slider_value,ndview_ist)
        const { v, h } = slider_value
        if (ndview_ist) {
          ndview_ist.set_region(v, h)
          ndview_ist.viewAsPix(heatmapPlot)
          // console.log('get thumbnail', ndview_ist.getThumbnail())
        }
      }
    )
  }

)




</script>

<style scoped>
.main {
  width: 100%;
  height: 100%;
}
</style>