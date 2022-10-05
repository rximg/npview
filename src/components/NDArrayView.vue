<template>
  <div ref="mainNDViewHandle" @mousewheel.prevent="scrollevent" @mousedown="onmousedown" @mouseup="onmouseup">
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
//TODO  输入的宽高是反的
import { reactive, onMounted, ref, type Ref } from "vue"
import { NdView } from "../obj/ndview"
import { Heatmap } from '@antv/g2plot'
import _ from 'lodash'
// import { useElementSize } from '@vueuse/core'
const props = defineProps(['inputarr','width','height'])//TODO 传入的是inputarray，是否需要传入宽高
// console.log('input data',props.inputarr)
var heatmapPlot: Heatmap = null

const imageShowHandle: Ref<HTMLCanvasElement> = ref(null)
const pixShowHandle: Ref<HTMLElement> = ref(null)
const mainNDViewHandle = ref(null)
const isImageShow = ref(true)
var ndview_ist: NdView = null
const MINIMUM_SCALE: number = 0.2     // 最小缩放
const MAX_SCALE: number = 16           // 最大缩放
const MOVE_STEP: number = 50          // 移动步长
// TODO 组件宽高和图片切片宽高
// 作为 imgX，imgY 在scale的情况下有个范围

const elSize = {width:props.width,height:props.height}
// console.log('el width height', elwidth, elheight)
const scrollevent = function (e) {
  const { clientX, clientY, wheelDelta } = e
  const pos = windowToCanvas(clientX, clientY)
  // 计算图片的位
  var { imgX, imgY, imgScale } = ndview_ist.scaleShape;
  const newPos = { x: Number(((pos.x - imgX) / imgScale).toFixed(2)), y: Number(((pos.y - imgY) / imgScale).toFixed(2)) }
  // 判断是放大还是缩小
  if (wheelDelta > 0) { // 放大
    imgScale += 0.5
    if (imgScale >= MAX_SCALE) {
      imgScale = MAX_SCALE
    }
  } else { // 缩小
    imgScale -= 0.5
    if (imgScale <= MINIMUM_SCALE) {
      imgScale = MINIMUM_SCALE
    }
  }
  // 计算图片的位置， 根据当前缩放比例，计算新的位置
  imgX = (1 - imgScale) * newPos.x + (pos.x - newPos.x);
  imgY = (1 - imgScale) * newPos.y + (pos.y - newPos.y);
  ndview_ist.scaleShape = { imgX, imgY, imgScale }
  if (imgScale == MAX_SCALE) {
    isImageShow.value = false
    ndview_ist.viewAsPix(heatmapPlot);
  } else {
    isImageShow.value = true
    ndview_ist.drawImage();
  }

}
const onmousedown = function (event) {
  var pos = windowToCanvas(event.clientX, event.clientY);  //坐标转换，将窗口坐标转换成canvas的坐标
  imageShowHandle.value.onmousemove = _.throttle(function (evt) {  //移动
    imageShowHandle.value.style.cursor = 'move';
    var posl = windowToCanvas(evt.clientX, evt.clientY);
    console.log('on mouse move', pos, posl)
    var xoffset = posl.x - pos.x
    var yoffset = posl.y - pos.y
    var {imgScale,imgX,imgY} = ndview_ist.scaleShape
    var xRangeStart = (imgScale-1)*elSize.width 
    var yRangeStart = (imgScale-1)*elSize.height
    if (Math.abs(xoffset) > Math.abs(yoffset)) {
      if (xoffset > 0) {
        imgX += MOVE_STEP;
        if (imgX>0){
          imgX = 0
        }
      } else  {
        imgX -= MOVE_STEP;
        if (imgX<-xRangeStart){
          imgX = -xRangeStart
        }
      }
    }
    else {
      if (yoffset > 0) {
        imgY += MOVE_STEP;
        if (imgY>0){
          imgY=0
        }
      } else {
        imgY -= MOVE_STEP
        if (imgY<-yRangeStart){
          imgY = - yRangeStart
        }
      }
    }
    ndview_ist.scaleShape = {
      imgX:imgX,
      imgY:imgY,
      imgScale:imgScale
    }
    ndview_ist.drawImage();  //重新绘制图片
  }, 500)
}
const onmouseup = function () {
  imageShowHandle.value.onmousemove = null;
  imageShowHandle.value.onmouseup = null;
  imageShowHandle.value.style.cursor = 'default';
};

/*坐标转换*/
function windowToCanvas(x, y) {
  var box = imageShowHandle.value.getBoundingClientRect();  //这个方法返回一个矩形对象，包含四个属性：left、top、right和bottom。分别表示元素各边与页面上边和左边的距离
  return {
    x: x - box.left - (box.width - imageShowHandle.value.width) / 2,
    y: y - box.top - (box.height - imageShowHandle.value.height) / 2
  };
}
onMounted(
  () => {
    // canvasEventsInit()
    //context = imageShowHandle.value.getContext('2d');//画布显示二维图片
    ndview_ist = new NdView(props.inputarr, elSize, imageShowHandle.value)
    // ndview_ist.viewAsImage();
    ndview_ist.drawImage()
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
          formatter: (datum) => datum.format,
          style: {
            fill: '#fff',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)',
            fontSize: 8,
          },
        },
        autoFit: false,
        width: elSize.width,
        height: elSize.height,
      },

    )
    heatmapPlot.render()
  }
)




</script>

<style>
</style>